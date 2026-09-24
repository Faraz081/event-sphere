import { useEffect } from "react";

const useInitTheme = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") document.documentElement.classList.add("light");
  }, []);
};

export default useInitTheme;