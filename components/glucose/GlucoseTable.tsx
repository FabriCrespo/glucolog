import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ClipboardList, Inbox } from 'lucide-react';

interface GlucoseRecord {
  glucoseLevel: number;
  date: string;
  time: string;
  ateSomething: boolean;
  foodMeal?: string | null;
  foodEaten?: string | null;
}

interface GlucoseTableProps {
  records: GlucoseRecord[];
  fetchingRecords: boolean;
}

const GlucoseTable = ({ records, fetchingRecords }: GlucoseTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  
  // Calcular el total de páginas
  const totalPages = Math.ceil(records.length / recordsPerPage);
  
  // Obtener los registros de la página actual
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  
  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para determinar el color de fondo según el nivel de glucosa
  const getGlucoseLevelColor = (level: number) => {
    if (level < 70) return "bg-amber-100 text-amber-900 ring-1 ring-amber-200/80";
    if (level > 140) return "bg-red-100 text-red-900 ring-1 ring-red-200/80";
    return "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/80";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/30 p-6 shadow-sm"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 ring-1 ring-emerald-100/80">
            <ClipboardList className="h-5 w-5 text-vitality-primary" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Historial
            </h2>
            <p className="text-xs text-slate-500">Últimas lecturas guardadas</p>
          </div>
        </div>

        <div className="w-fit rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900">
          {records.length} {records.length === 1 ? "registro" : "registros"}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-inner">
        {fetchingRecords ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[1px]">
            <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-200 border-t-vitality-primary" />
            <p className="text-sm text-slate-600">Cargando registros…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/90 text-left">
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      ¿Comió?
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Comida
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Detalle
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Glucosa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="transition-colors hover:bg-emerald-50/40"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          <div className="font-medium text-slate-900">{record.date}</div>
                          <div className="text-xs text-slate-500">{record.time}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              record.ateSomething
                                ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/70"
                                : "bg-slate-100 text-slate-700 ring-1 ring-slate-200/80"
                            }`}
                          >
                            {record.ateSomething ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          {record.foodMeal || "—"}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                          {record.foodEaten || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                            getGlucoseLevelColor(record.glucoseLevel)
                          }`}>
                            {record.glucoseLevel} mg/dL
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center">
                        <div className="flex flex-col items-center">
                          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
                            <Inbox className="h-7 w-7 text-slate-400" strokeWidth={1.5} aria-hidden />
                          </div>
                          <p className="text-base font-semibold text-slate-700">Aún no hay registros</p>
                          <p className="mt-1 max-w-sm text-sm text-slate-500">
                            Añade tu primera lectura en el panel izquierdo para verla aquí.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {records.length > 0 && (
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-4">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-600">
                      Mostrando <span className="font-medium">{indexOfFirstRecord + 1}</span> a{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastRecord, records.length)}
                      </span>{" "}
                      de <span className="font-medium">{records.length}</span> registros
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      type="button"
                      className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" strokeWidth={2} />
                      Anterior
                    </button>
                    
                    <div className="hidden md:flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Mostrar 5 páginas centradas en la página actual
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            type="button"
                            className={`relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                              currentPage === pageNum
                                ? "bg-vitality-primary text-white shadow-sm"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      type="button"
                      className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? "cursor-not-allowed bg-slate-100 text-slate-400"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/50"
                      }`}
                    >
                      Siguiente
                      <ChevronRight className="ml-1 h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GlucoseTable;

