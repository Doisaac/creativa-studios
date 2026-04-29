import workBranding from '@/assets/work-branding.jpg'
import workBanners from '@/assets/work-banners.jpg'
import workStickers from '@/assets/work-stickers.jpg'
import workPromo from '@/assets/work-promo.jpg'
import workSublimation from '@/assets/work-sublimation.jpg'
import workPrint from '@/assets/work-print.jpg'

import {
  Palette,
  Megaphone,
  Gift,
  Sticker,
  Printer,
  Sparkles,
  ShieldCheck,
  Boxes,
  Workflow,
  Zap,
} from 'lucide-react'

export const services = [
  {
    icon: Palette,
    title: 'Diseño gráfico',
    desc: 'Identidad visual, piezas digitales y materiales editoriales con dirección creativa.',
  },
  {
    icon: Megaphone,
    title: 'Material publicitario',
    desc: 'Vallas, banners, lonas y campañas visuales con alto impacto en calle.',
  },
  {
    icon: Gift,
    title: 'Promocionales personalizados',
    desc: 'Tazas, camisas, tote bags y merchandising para activaciones de marca.',
  },
  {
    icon: Sticker,
    title: 'Viniles y rotulación',
    desc: 'Vehículos, vidrieras, paredes y stickers troquelados con corte de precisión.',
  },
  {
    icon: Printer,
    title: 'Impresiones comerciales',
    desc: 'Tarjetas, brochures, flyers y catálogos en acabados premium.',
  },
  {
    icon: Sparkles,
    title: 'Branding para negocios',
    desc: 'Estrategia, naming, logotipo y manual de marca para crecer con coherencia.',
  },
]

export const benefits = [
  {
    icon: Workflow,
    title: 'Producción organizada',
    desc: 'Cada pedido pasa por un flujo claro: diseño → aprobación → producción → entrega.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguimiento confiable',
    desc: 'Sabemos en qué etapa va tu trabajo en todo momento, sin promesas vacías.',
  },
  {
    icon: Boxes,
    title: 'Gestión profesional de materiales',
    desc: 'Inventario controlado para que nunca se atrase un trabajo por falta de insumos.',
  },
  {
    icon: Zap,
    title: 'Soluciones personalizadas',
    desc: 'Cotizaciones a tu medida según volumen, sustrato y tiempos.',
  },
]

export const portfolio = [
  { src: workBranding, label: 'Branding', tag: 'Identidad' },
  { src: workBanners, label: 'Vallas & banners', tag: 'Outdoor' },
  { src: workStickers, label: 'Stickers troquelados', tag: 'Vinil' },
  { src: workPromo, label: 'Promocionales', tag: 'Merch' },
  { src: workSublimation, label: 'Sublimación', tag: 'Textil' },
  { src: workPrint, label: 'Impresos comerciales', tag: 'Print' },
]

export const testimonials = [
  {
    name: 'María Hernández',
    role: 'Pastelería Dulce Hogar',
    text: 'Las tarjetas y empaques quedaron impecables. La atención fue personalizada y entregaron antes del plazo.',
  },
  {
    name: 'Carlos Menjívar',
    role: 'Auto Repuestos CM',
    text: 'Rotularon mi local y vehículos. Calidad profesional y precio justo. Recomendados al 100%.',
  },
  {
    name: 'Andrea Rivas',
    role: 'Café Verde',
    text: 'Nos rediseñaron la marca de cero. El proceso fue claro y el resultado superó expectativas.',
  },
  {
    name: 'Jorge Alfaro',
    role: 'Clínica Salud+',
    text: 'Trabajan con seriedad. Toda la papelería y señalética llegó perfecta y a tiempo.',
  },
]

export const partners = [
  'Café Verde',
  'Auto Repuestos CM',
  'Dulce Hogar',
  'Salud+',
  'Verde Studio',
  'Casa Rivas',
  'Punto Azul',
  'Norte Co.',
]
