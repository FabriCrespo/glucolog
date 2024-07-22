import Image from "next/image";
import Link from "next/link";

type ButtonProps = {
  type: 'button' | 'submit';
  title: string;
  icon?: string;
  variant: string;
  full?: boolean;
  link?: string;
  onClick?: () => void; // Agregar la propiedad onClick opcional
}

const Button = ({ type, title, icon, variant, full, link, onClick }: ButtonProps) => {
  return (
    <Link href={link || '/'}> 
      <button 
        className={`flexCenter gap-3 rounded-full border mt-3 ${variant} ${full && 'w-full'}`} 
        type={type}
        onClick={onClick} // Manejar el evento onClick opcional
      >
        {icon && <Image src={icon} alt={title} width={24} height={24} />}
        <label className="bold-16 whitespace-nowrap cursor-pointer">{title}</label>
      </button>
    </Link>
  );
}

export default Button;
