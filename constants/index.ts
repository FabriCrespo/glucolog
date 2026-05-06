// NAVIGATION
export const NAV_LINKS = [
    { href: '/', key: 'home', label: 'Home ' },
    { href: '/dashboard', key: 'dashboard', label: 'Dashboard ' },
    { href: '/foodbank', key: 'food_bank', label: 'Alimentos ' },
    { href: '/schedule', key: 'Schedule', label: 'Recordatorios y Horarios' },
    { href: '/myprofile', key: 'my_profile', label: 'Mi Perfil' },
  ];
  
  // CAMP SECTION
  export const PEOPLE_URL = [
    '/person-1.png',
    '/person-2.png',
    '/person-3.png',
    '/person-4.png',
  ];
  
  /** Iconos de la home: solo Lucide (línea única). Ver mapeo en `app/page.tsx`. */
  export type HomeFeatureIconId = "droplets" | "utensils" | "bell" | "sparkles"

  // FEATURES SECTION
  export const FEATURES: {
    title: string
    icon: HomeFeatureIconId
    description: string
  }[] = [
    {
      title: "Registro y control de niveles de glucosa",
      icon: "droplets",
      description:
        "Registra y controla tus niveles de glucosa en sangre fácilmente desde nuestra aplicación. Mantén un seguimiento preciso para una mejor gestión de tu salud.",
    },
    {
      title: "Información nutricional de alimentos",
      icon: "utensils",
      description:
        "Accede a información nutricional detallada sobre alimentos según la tabla boliviana de composición de alimentos. Toma decisiones informadas para una dieta saludable.",
    },
    {
      title: "Recordatorios para ejercicio y medicación",
      icon: "bell",
      description:
        "Establece recordatorios personalizados para realizar ejercicio y tomar medicamentos. Mantén tu rutina de salud en orden y nunca te olvides de cuidarte.",
    },
    {
      title: "Predicciones de niveles de glucosa",
      icon: "sparkles",
      description:
        "Obtén predicciones inteligentes de tus niveles de glucosa en sangre utilizando tecnología de inteligencia artificial. Prepárate para lo que viene y toma el control de tu diabetes.",
    },
  ]
  
  
  export const FOOTER_CONTACT_INFO = {
    title: 'Contact Us',
    links: [
      { label: 'Admin Officer', value: '123-456-7890' },
      { label: 'Email Officer', value: 'hilink@akinthil.com' },
    ],
  };
  


  