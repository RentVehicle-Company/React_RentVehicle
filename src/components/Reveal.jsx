import { motion } from "framer-motion";

const Reveal = ({
  children,
  delay = 0,
  className = "",
  y = 24,
  scale = 0.96,
}) => {
  return (
    <motion.div
      className={`will-change-transform ${className}`}
      initial={{ opacity: 0, y, scale }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.55, delay: delay / 1000, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;