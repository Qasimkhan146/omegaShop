"use client";

import Hero from "../components/hero";
import Panel from "../components/panel";
import Products from "../components/products";
import Carousel from "../components/carousel";
import WhyOmega from "../components/whyOmega";
import Panel2 from "../components/panel2";
import FAQs from "../components/faq";
import Discover from "../components/discover";

const Page = () => {
  return (
    <>
      <Hero />
      <Panel />
      <Products />
      <Carousel />
      <WhyOmega />
      <Panel2 />
      <FAQs />
      <Discover />
    </>
  );
};

export default Page;
