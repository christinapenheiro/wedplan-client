export type IAccountRole =
  | "customer"
  | "vendor"
  | "admin";

export type IServiceCategory =
  | "photography"
  | "venue"
  | "floral"
  | "catering"
  | "makeup"
  | "fashion"
  | "music"
  | "planner";

/** Form state used in the Add Service form (before submission) */
export interface IAddServiceForm {
  title: string;
  category: IServiceCategory;
  price: number;
  description: string;
  /** ImgBB URLs collected after uploading the selected files */
  imageUrls: string[];
}

/** Full service document as returned from the backend */
export interface IService extends IAddServiceForm {
  _id: string;
  vendorId: string;
  vendorEmail: string;
  /** Optional vendor display name, when the record includes one. */
  vendorName?: string;
  /** Optional vendor location, when the record includes one. */
  location?: string;
  createdAt: string;
  status: "active" | "pending" | "declined";
  /** Vendor-controlled booking availability; missing on legacy records means available. */
  isAvailable?: boolean;
}

/** Fields collected from the booking request form */
export interface IBookingFormData {
  eventDate: string;
  eventLocation: string;
  additionalMessage: string;
  customerName?: string;
  customerEmail?: string;
}

/** Complete booking payload combining service info and customer submission */
export interface IBookingPayload extends IBookingFormData {
  serviceId: string;
  serviceTitle: string;
  serviceLocation?: string;
  vendorId: string;
  vendorEmail: string;
  vendorName?: string;
  customerId?: string;
  customerRole?: IAccountRole;
  status: "Pending" | "Accepted" | "Declined";
  createdAt: string;
}
