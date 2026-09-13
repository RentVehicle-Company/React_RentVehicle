import { motion } from "framer-motion";

const Title = ({ title, subTitle, align }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center text-center 
        ${align === "left" && "md:items-start md:text-left"}`}
    >
      <h1 className="text-2xl font-semibold text-slate-900 md:text-3xl">
        {title}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-gray-500/90">{subTitle}</p>
    </motion.div>
  );
};

export default Title;