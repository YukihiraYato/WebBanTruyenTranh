export default function ErrorFallback({ error }: { error: Error }) {
  return <div className="text-red-500">Đã xảy ra lỗi: {error.message}</div>
}
