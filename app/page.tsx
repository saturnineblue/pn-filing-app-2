import Navbar from '@/components/navbar'
import CSVUploadForm from '@/components/csv-upload-form'
import ManualEntryForm from '@/components/manual-entry-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Standart PN Notice Filer
          </h1>
          
          <div className="space-y-8">
            <CSVUploadForm />
            <ManualEntryForm />
          </div>
        </div>
      </main>
    </div>
  )
}
