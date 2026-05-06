import Image from "next/image";
import Link from "next/link";

type ButtonProps = {
  type: 'button' | 'submit';
  title: string;
  icon?: string;
  /** Icon after label (e.g. arrow on primary CTA) */
  iconEnd?: boolean;
  variant: string;
  full?: boolean;
  link?: string;
  onClick?: () => void; // Agregar la propiedad onClick opcional
}

const Button = ({ type, title, icon, iconEnd, variant, full, link, onClick }: ButtonProps) => {
  const iconEl =
    icon ? (
      <Image src={icon} alt="" width={24} height={24} aria-hidden />
    ) : null;

  return (
    <Link href={link || '/'} className={full ? 'w-full' : undefined}>
      <button
        className={`flexCenter mt-3 gap-2.5 rounded-full border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vitality-primary focus-visible:ring-offset-2 ${variant} ${full ? 'w-full' : ''}`}
        type={type}
        onClick={onClick}
      >
        {!iconEnd && iconEl}
        <span className="cursor-pointer whitespace-nowrap text-[15px] font-semibold leading-none">
          {title}
        </span>
        {iconEnd && iconEl}
      </button>
    </Link>
  );
}

export default Button;
