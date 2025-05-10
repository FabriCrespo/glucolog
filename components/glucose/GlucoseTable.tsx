import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, AlertCircle } from 'lucide-react';

interface GlucoseRecord {
  glucoseLevel: number;
  date: string;
  time: string;
  ateSomething: boolean;
  foodMeal?: string | null;
  foodEaten?: string | null;
}

interface GlucoseTableProps {
  records: GlucoseRecord[];
  fetchingRecords: boolean;
}

const GlucoseTable = ({ records, fetchingRecords }: GlucoseTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  
  // Calcular el total de páginas
  const totalPages = Math.ceil(records.length / recordsPerPage);
  
  // Obtener los registros de la página actual
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = records.slice(indexOfFirstRecord, indexOfLastRecord);
  
  // Cambiar de página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
  
  // Ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Función para determinar el color de fondo según el nivel de glucosa
  const getGlucoseLevelColor = (level: number) => {
    if (level < 70) return 'bg-yellow-100 text-yellow-800';
    if (level > 140) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white w-full md:w-[63%] flex-1 border border-gray-200 rounded-2xl shadow-lg p-6 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-50 p-2 rounded-lg mr-3">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Historial de Registros
          </h1>
        </div>
        
        <div className="text-sm text-white bg-green-50 px-3 py-1 rounded-full">
          {records.length} registros en total
        </div>
      </div>
      
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {fetchingRecords ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-90 z-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-50 mb-3"></div>
            <p className="text-gray-600">Cargando registros...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-50 bg-opacity-30 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comió Algo
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comida
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Qué Comió
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nivel de Glucosa
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRecords.length > 0 ? (
                    currentRecords.map((record, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-green-50 hover:bg-opacity-10"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="font-medium">{record.date}</div>
                          <div className="text-gray-500 text-xs">{record.time}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            record.ateSomething 
                              ? 'bg-green-50 bg-opacity-20 text-green-50' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {record.ateSomething ? "Sí" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {record.foodMeal || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {record.foodEaten || "—"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                            getGlucoseLevelColor(record.glucoseLevel)
                          }`}>
                            {record.glucoseLevel} mg/dL
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <AlertCircle className="h-10 w-10 text-green-50 opacity-40 mb-2" />
                          <p className="text-gray-500 text-lg font-medium">No hay registros disponibles</p>
                          <p className="text-gray-400 text-sm mt-1">Registra tu primer nivel de glucosa para comenzar</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Paginación */}
            {records.length > 0 && (
              <div className="bg-green-50 bg-opacity-10 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexOfFirstRecord + 1}</span> a{" "}
                      <span className="font-medium">
                        {Math.min(indexOfLastRecord, records.length)}
                      </span>{" "}
                      de <span className="font-medium">{records.length}</span> registros
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-green-50 hover:bg-opacity-20 border border-gray-300"
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </button>
                    
                    <div className="hidden md:flex space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Mostrar 5 páginas centradas en la página actual
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => paginate(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                              currentPage === pageNum
                                ? "bg-green-50 text-white"
                                : "bg-white text-gray-700 hover:bg-green-50 hover:bg-opacity-20 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-green-50 hover:bg-opacity-20 border border-gray-300"
                      }`}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GlucoseTable;

