import Banner from "@/components/home/Banner";
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
    featuredServices = res ?? [];
  } catch (error) {
    console.error("Failed to load featured services on homepage:", error);
    featuredServices = [];
  }

  return (
    <div className="flex flex-col w-full">
      <Banner />
      <FeaturedServices services={featuredServices} />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}
