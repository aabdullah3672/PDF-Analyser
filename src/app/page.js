import Image from "next/image";
import styles from "./page.module.css";
import PDFUploader from "./upload/PDFUploader";

export default function Home() {
  return (
    <div>
     <PDFUploader />
    </div>
  );
}
