import { ProductNewProvider } from "@/hooks/UseProductNew";
import New from "./components/new";
export default function NewProductPage() {
  return (
    <ProductNewProvider>
      <New />
    </ProductNewProvider>
  )
}