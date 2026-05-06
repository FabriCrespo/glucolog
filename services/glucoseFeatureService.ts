import { db } from "@/app/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  Timestamp,
} from "firebase/firestore";
import type { Event } from "@/types/events";
import type { GlucoseRecord } from "@/types/glucose";
import type { GlucoseFeatureRow } from "@/types/glucose-feature";

function toMillis(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : null;
}

function clampHour(value: number): number {
  if (value < 0) return 0;
  if (value > 23) return 23;
  return value;
}

function parseCompletedEventTime(event: Event): number | null {
  const completed = toMillis(event.completedAt);
  if (completed != null) return completed;
  return toMillis(event.dateTime);
}

function toIntensityScore(intensity: Event["intensity"]): number {
  if (intensity === "alta") return 3;
  if (intensity === "media") return 2;
  if (intensity === "baja") return 1;
  return 1;
}

function getReadingDate(record: GlucoseRecord): Date {
  if (record.recordedAt instanceof Timestamp) {
    return record.recordedAt.toDate();
  }
  return new Date(`${record.date}T${record.time}`);
}

function safeAvg(values: number[]): number | null {
  if (!values.length) return null;
  return Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
}

export async function upsertGlucoseFeatureRow(
  userId: string,
  sourceRecordId: string
): Promise<void> {
  if (!userId || !sourceRecordId) return;

  const recordRef = doc(db, "glucoseRecords", userId, "records", sourceRecordId);
  const recordSnap = await getDoc(recordRef);
  if (!recordSnap.exists()) return;

  const record = recordSnap.data() as GlucoseRecord;
  const readingDate = getReadingDate(record);
  const readingMs = readingDate.getTime();

  const eventsRef = collection(db, "users", userId, "events");
  const completedEventsSnap = await getDocs(query(eventsRef, where("completed", "==", true)));
  const completedEvents = completedEventsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Event, "id">) }))
    .filter((ev) => ev.type === "medication" || ev.type === "exercise");

  const medicationTimes: number[] = [];
  const exerciseData: Array<{ at: number; duration: number; intensity: number }> = [];

  for (const event of completedEvents) {
    const eventMs = parseCompletedEventTime(event);
    if (eventMs == null || eventMs > readingMs) continue;

    if (event.type === "medication") {
      medicationTimes.push(eventMs);
      continue;
    }

    const duration = event.actualDuration ?? event.plannedDuration ?? 0;
    exerciseData.push({
      at: eventMs,
      duration: Math.max(0, Math.min(720, duration)),
      intensity: toIntensityScore(event.intensity),
    });
  }

  const lastMedMs = medicationTimes.length ? Math.max(...medicationTimes) : null;
  const medsLast2h = medicationTimes.filter((t) => readingMs - t <= 2 * 60 * 60 * 1000).length;
  const medsLast4h = medicationTimes.filter((t) => readingMs - t <= 4 * 60 * 60 * 1000).length;
  const medsLast24h = medicationTimes.filter((t) => readingMs - t <= 24 * 60 * 60 * 1000).length;

  const lastExerciseMs = exerciseData.length
    ? Math.max(...exerciseData.map((item) => item.at))
    : null;
  const exerciseLast6h = exerciseData.some(
    (item) => readingMs - item.at <= 6 * 60 * 60 * 1000
  );
  const exerciseLast24h = exerciseData.filter(
    (item) => readingMs - item.at <= 24 * 60 * 60 * 1000
  );

  const recordsRef = collection(db, "glucoseRecords", userId, "records");
  const prevRecordsSnap = await getDocs(query(recordsRef, where("timeStamp", "<=", record.timeStamp)));
  const prevRecords = prevRecordsSnap.docs
    .map((d) => ({ id: d.id, ...(d.data() as GlucoseRecord) }))
    .sort((a, b) => getReadingDate(a).getTime() - getReadingDate(b).getTime());

  const currentIndex = prevRecords.findIndex((r) => r.id === sourceRecordId);
  const prevReading =
    currentIndex > 0 ? prevRecords[currentIndex - 1] : null;
  const last3 = prevRecords.slice(Math.max(0, currentIndex - 2), currentIndex + 1);

  const profileSnap = await getDoc(doc(db, "users", userId));
  const diabetesRaw = (profileSnap.data()?.diabetesType ?? "") as string;
  const diabetesType: "type1" | "type2" | "unknown" =
    diabetesRaw === "type1" || diabetesRaw === "type2" ? diabetesRaw : "unknown";

  const row: GlucoseFeatureRow = {
    schemaVersion: 1,
    sourceRecordId,
    userId,
    recordedAtIso: readingDate.toISOString(),
    glucoseMgDl: record.glucoseLevel,
    measurementContext: record.measurementContext,
    diabetesType,
    hourOfDay: clampHour(readingDate.getHours()),
    dayOfWeek: readingDate.getDay(),
    ateSomething: Boolean(record.ateSomething),
    minutesSinceMeal: record.minutesSinceMeal ?? null,
    medicationTakenRecently: Boolean(record.medicationTakenRecently),
    stressLevel: record.stressLevel ?? null,
    activityLevelLastHours: record.activityLevelLastHours,
    medTakenLast2h: medsLast2h > 0,
    medTakenLast4h: medsLast4h > 0,
    minutesSinceLastMedication:
      lastMedMs == null ? null : Math.max(0, Math.round((readingMs - lastMedMs) / 60000)),
    medicationEventsLast24h: medsLast24h,
    exerciseLast6h,
    exerciseDurationLast24h: exerciseLast24h.reduce((sum, item) => sum + item.duration, 0),
    exerciseIntensityScoreLast24h: exerciseLast24h.reduce(
      (sum, item) => sum + item.intensity,
      0
    ),
    minutesSinceLastExercise:
      lastExerciseMs == null
        ? null
        : Math.max(0, Math.round((readingMs - lastExerciseMs) / 60000)),
    deltaVsPrevReading: prevReading ? record.glucoseLevel - prevReading.glucoseLevel : null,
    rollingMean3: safeAvg(last3.map((r) => r.glucoseLevel)),
    createdAtIso: new Date().toISOString(),
  };

  const outRef = doc(db, "users", userId, "glucose_features", sourceRecordId);
  await setDoc(outRef, row, { merge: true });
}
