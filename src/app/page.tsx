import Banner from "@/components/home/Banner";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import FeaturedServices from "@/components/home/FeaturedServices";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import { clientApi } from "@/lib/api/clientApi";
import type { IService } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let featuredServices: IService[] = [];

  try {
    const res = await clientApi.get<IService[]>("/featured");
    featuredServices = (res ?? []).filter((item) => item.status === "active");
  } catch (error) {
    console.error("Failed to load featured services on homepage:", error);
    featuredServices = [];
  }

  return (
    <div className="flex flex-col w-full">
      <Banner />
      <CategoryShowcase />
      <FeaturedServices services={featuredServices} />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}
