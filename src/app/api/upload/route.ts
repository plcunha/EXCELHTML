import { NextRequest, NextResponse } from 'next/server'

// Limite de tamanho do arquivo (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024

// Tipos de arquivo permitidos
const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'text/csv', // csv
]

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    
    // Validar presença do arquivo
    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }
    
    // Validar tamanho
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo: 50MB' },
        { status: 400 }
      )
    }
    
    // Validar tipo
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(extension)
    
    if (!isValidType) {
      return NextResponse.json(
        { error: 'Tipo de arquivo não suportado. Use .xlsx, .xls ou .csv' },
        { status: 400 }
      )
    }
    
    // Retornar informações do arquivo para processamento client-side
    // O parsing real é feito no cliente para evitar custos de servidor
    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      message: 'Arquivo validado. Processamento será feito no cliente.',
    })
    
  } catch (error) {
    console.error('Erro no upload:', error)
    return NextResponse.json(
      { error: 'Erro interno ao processar upload' },
      { status: 500 }
    )
  }
}
