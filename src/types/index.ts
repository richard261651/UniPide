export type Role = 'CLIENTE' | 'EMPRENDEDOR' | 'ADMIN';

export type BusinessStatus = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'SUSPENDIDO';

export type OrderStatus = 'RECIBIDO' | 'EN_PREPARACION' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

export interface UserSession {
  id: string;
  nombre: string;
  correo: string;
  correoPersonal?: string | null;
  rol: Role;
  telefono?: string | null;
  foto?: string | null;
  businessId?: string | null;
  businessSlug?: string | null;
  businessName?: string | null;
  businessEstadoAprobacion?: string | null;
  businessPagoVerificado?: boolean;
  businessActivo?: boolean;
}

export interface BusinessItem {
  id: string;
  userId: string;
  nombre: string;
  slug: string;
  categoria: string;
  descripcion: string;
  logo: string | null;
  banner: string | null;
  ubicacionCampus: string;
  zonaCampusCodigo: string;
  tiempoBasePrepMin: number;
  estadoAprobacion: BusinessStatus;
  activo: boolean;
  fechaCreacion: string | Date;
  esFundador?: boolean;
  fechaAprobacion?: string | Date | null;
  fechaInicioPromocion?: string | Date | null;
  fechaFinPromocion?: string | Date | null;
  suscripcionEstado?: string;
  suscripcionMonto?: number;
  metodoPagoSuscripcion?: string | null;
  fechaUltimoPago?: string | Date | null;
  tipoSuscripcion?: string;
  pagoVerificado?: boolean;
  fechaPagoVerificado?: string | Date | null;
  wompiTransactionId?: string | null;
  wompiReference?: string | null;
  fechaNotificacionExpiracion?: string | Date | null;
  firmaPoliticaHigiene?: boolean;
  fechaFirmaPolitica?: string | Date | null;
  versionPolitica?: string | null;
  nombreFirmante?: string | null;
  documentoFirmante?: string | null;
  contratoDriveUrl?: string | null;
  contratoDriveId?: string | null;
  user?: {
    nombre: string;
    correo: string;
    correoPersonal?: string | null;
    telefono?: string | null;
    correoVerificado?: boolean;
  };
  products?: ProductItem[];
  ratings?: RatingItem[];
  _count?: {
    products?: number;
    orders?: number;
    ratings?: number;
  };
  avgRating?: number;
}

export interface ProductItem {
  id: string;
  businessId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  foto: string | null;
  fotos?: string[];
  stock: number;
  disponible: boolean;
  categoria?: string | null;
  esOferta: boolean;
  precioOferta?: number | null;
  descripcionOferta?: string | null;
  fechaInicioOferta?: string | Date | null;
  fechaFinOferta?: string | Date | null;
  tieneTallas?: boolean;
  tallasDisponibles?: string[];
  tieneColores?: boolean;
  coloresDisponibles?: string[];
  tieneVariaciones?: boolean;
  nombreVariaciones?: string | null;
  opcionesVariaciones?: string[];
  business?: {
    id: string;
    nombre: string;
    slug: string;
    categoria?: string;
    logo?: string | null;
    ubicacionCampus: string;
    zonaCampusCodigo: string;
    tiempoBasePrepMin: number;
  };
}

export interface CartItem {
  product: ProductItem;
  cantidad: number;
  tallaSeleccionada?: string;
  colorSeleccionado?: string;
  variacionSeleccionada?: string;
  opcionesSeleccionadas?: string;
  notas?: string;
}

export interface CampusZoneItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  coordenadaRefX?: number | null;
  coordenadaRefY?: number | null;
}

export interface OrderItemDetail {
  id: string;
  orderId: string;
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  opcionesSeleccionadas?: string | null;
  notas?: string | null;
  product?: ProductItem;
}

export interface OrderDetail {
  id: string;
  codigoPedido: string;
  clienteId: string;
  businessId: string;
  estado: OrderStatus;
  subtotal: number;
  total: number;
  zonaEntregaCodigo: string;
  zonaEntregaNombre: string;
  detalleUbicacion?: string | null;
  tiempoEstimadoMin: number;
  instrucciones?: string | null;
  metodoPago: string;
  repartidorLat?: number | null;
  repartidorLng?: number | null;
  ubicacionRepartidorNombre?: string | null;
  ultimaUbicacionActualizada?: string | Date | null;
  fechaCreacion: string | Date;
  fechaActualizacion: string | Date;
  cliente?: {
    id: string;
    nombre: string;
    correo: string;
    telefono?: string | null;
    foto?: string | null;
  };
  business?: {
    id: string;
    nombre: string;
    slug: string;
    logo?: string | null;
    ubicacionCampus: string;
    zonaCampusCodigo: string;
    telefono?: string | null;
  };
  items: OrderItemDetail[];
  rating?: RatingItem | null;
}

export interface RatingItem {
  id: string;
  orderId: string;
  clienteId: string;
  businessId: string;
  puntuacion: number;
  comentario: string | null;
  fechaCreacion: string | Date;
  cliente?: {
    nombre: string;
    foto?: string | null;
  };
}

export interface DeliveryEstimateResult {
  tiempoTotalMin: number;
  tiempoBasePrepMin: number;
  tiempoTrasladoMin: number;
  rangoTexto: string;
  origenNombre: string;
  destinoNombre: string;
}
