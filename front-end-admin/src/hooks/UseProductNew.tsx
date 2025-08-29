import { useState } from 'react'
import { Category } from '@/resources/categories'
import { toast } from 'sonner'
import { createNewBook } from '@/api/book'
import { createContext, useContext} from 'react' 

interface ProductNewContextType {
  thumbnail: File | null
  setThumbnail: (file: File | null) => void
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  gallery: (File | null)[]
  setGallery: (files: (File | null)[]) => void
  category: Category | null
  setCategory: (category: Category | null) => void
  genre: number
  setGenre: (genre: number) => void
  author: string
  setAuthor: (author: string) => void
  age: number
  setAge: (age: number) => void
  price: number
  setPrice: (price: number) => void
  format: string
  setFormat: (format: string) => void
  language: string
  setLanguage: (language: string) => void
  pageCount: number
  setPageCount: (pageCount: number) => void
  weight: number
  setWeight: (weight: number) => void
  size: string
  setSize: (size: string) => void
  publishYear: string
  setPublishYear: (publishYear: string) => void
  translator: string
  setTranslator: (translator: string) => void
  publisher: string
  setPublisher: (publisher: string) => void
  qtyInStock: number
  setQtyInStock: (qtyInStock: number) => void
  supplier: string
  setSupplier: (supplier: string) => void
  productCode: string
  setProductCode: (productCode: string) => void
  uploadToServer: () => Promise<void>
} 
const ProductNewContext = createContext<ProductNewContextType | null>(null)
export function ProductNewProvider({children}: {children: React.ReactNode}) {
  /* State variables for product details */
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gallery, setGallery] = useState<(File | null)[]>([])
  const [category, setCategory] = useState<Category | null>(null)
  const [genre, setGenre] = useState<number>(1)
  const [author, setAuthor] = useState('')
  const [age, setAge] = useState<number>(0)
  const [price, setPrice] = useState<number>(0)
  const [format, setFormat] = useState<string>('')
  const [language, setLanguage] = useState<string>('')
  const [pageCount, setPageCount] = useState<number>(0)
  const [weight, setWeight] = useState<number>(0)
  const [size, setSize] = useState<string>('')
  const [publishYear, setPublishYear] = useState<string>('')
  const [translator, setTranslator] = useState<string>('')
  const [publisher, setPublisher] = useState<string>('')
  const [qtyInStock, setQtyInStock] = useState<number>(0)
  const [supplier, setSupplier] = useState<string>('')
  const [productCode, setProductCode] = useState('')

  const uploadToServer = async () => {
    const formData = new FormData()

    if (thumbnail) {
      formData.append('thumbnail', thumbnail)
    }

    formData.append('title', title)
     console.log('Có thấy value của titile ở custom hook ko ?:', title)
    formData.append('description', description)
   

    if (category !== null) {
      formData.append('category_id', category.id.toString())
    }

    formData.append('genre_id', genre.toString())
    formData.append('author', author)
    formData.append('age', age.toString())
    formData.append('price', price.toString())
    formData.append('format', format)
    formData.append('language', language)
    formData.append('page_count', pageCount.toString())
    formData.append('weight', weight.toString())
    formData.append('size', size)
    formData.append('publish_year', publishYear)
    formData.append('translator', translator)
    formData.append('publisher', publisher)
    formData.append('qty_in_stock', qtyInStock.toString())
    formData.append('supplier', supplier)
    formData.append('product_code', productCode)
    gallery
      .filter((f): f is File => !!f)
      .forEach((file) => {
        formData.append('gallery', file)
      })
    // if (thumbnail) {
    //   formData.append('thumbnail', thumbnail)
    // }

    // for (const [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value)
    // }

    await createNewBook(formData)
    toast('Thao tác thành công!', {
      description: 'Sách mới đã được tạo thành công.',
      action: {
        label: 'Xác nhận',
        onClick: () => {},
      },
      duration: 5000
    })
  }

  return (
    <ProductNewContext.Provider
    value={{
  thumbnail,
  setThumbnail,
  title,
  setTitle,
  description,
  setDescription,
  gallery,
  setGallery,
  category,
  setCategory,
  genre,
  setGenre,
  author,
  setAuthor,
  age,
  setAge,
  price,
  setPrice,
  format,
  setFormat,
  language,
  setLanguage,
  pageCount,
  setPageCount,
  weight,
  setWeight,
  size,
  setSize,
  publishYear,
  setPublishYear,
  translator,
  setTranslator,
  publisher,
  setPublisher,
  qtyInStock,
  setQtyInStock,
  supplier,
  setSupplier,
  productCode,
  setProductCode,
  uploadToServer,
}}
    >
      {children}  
    </ProductNewContext.Provider>
  )

    // reset: () => {
    //   setThumbnail(null)
    //   setTitle('')
    //   setDescription('')
    //   setGallery([])
    //   setCategory(null)
    //   setGenre(1)
    //   setAuthor('')
    //   setAge(0)
    //   setPrice(0)
    //   setFormat('')
    //   setLanguage('')
    //   setPageCount(0)
    //   setWeight(0)
    //   setSize('')
    //   setPublishYear('')
    //   setTranslator('')
    //   setPublisher('')
    //   setQtyInStock(0)
    //   setSupplier('')
    //   setProductCode('')
    // },
  
}

export const useProductNewContext = ()=>{
  const context = useContext(ProductNewContext)
  if (!context) {
    throw new Error('useProductNewContext must be used within a ProductNewProvider')
  }
  return context
}
