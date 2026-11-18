export type IAccountRole = "Customer" | "Vendor" | "Admin";

export type IServiceCategory =
  | "Photography"
  | "Venue"
  | "Floral"
  | "Catering"
  | "Makeup"
  | "Fashion"
  | "Music"
  | "Planner";

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
  createdAt: string;
  status: "Active" | "Draft" | "Pending";
}
