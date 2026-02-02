import { NextRequest, NextResponse } from 'next/server'
import type { DataSchema, CompanyConfig } from '@/types'
import { DataSchemaSchema, CompanyConfigSchema } from '@/types'

// Armazenamento em memória (em produção, usar banco de dados)
const schemasStore = new Map<string, DataSchema>()
const companiesStore = new Map<string, CompanyConfig>()

// ============================================
// ENDPOINTS DE SCHEMAS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  
  try {
    switch (type) {
      case 'schema':
        if (id) {
          const schema = schemasStore.get(id)
          if (!schema) {
            return NextResponse.json({ error: 'Schema não encontrado' }, { status: 404 })
          }
          return NextResponse.json(schema)
        }
        return NextResponse.json(Array.from(schemasStore.values()))
        
      case 'company':
        if (id) {
          const company = companiesStore.get(id)
          if (!company) {
            return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
          }
          return NextResponse.json(company)
        }
        return NextResponse.json(Array.from(companiesStore.values()))
        
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao buscar configuração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  
  try {
    const body = await request.json()
    
    switch (type) {
      case 'schema': {
        // Validar schema
        const result = DataSchemaSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Schema inválido', details: result.error.errors },
            { status: 400 }
          )
        }
        
        const schema = result.data
        schemasStore.set(schema.id, schema)
        
        return NextResponse.json({
          success: true,
          message: 'Schema salvo com sucesso',
          schema,
        })
      }
      
      case 'company': {
        // Validar configuração de empresa
        const result = CompanyConfigSchema.safeParse(body)
        if (!result.success) {
          return NextResponse.json(
            { error: 'Configuração inválida', details: result.error.errors },
            { status: 400 }
          )
        }
        
        const company = result.data
        companiesStore.set(company.id, company)
        
        return NextResponse.json({
          success: true,
          message: 'Configuração de empresa salva com sucesso',
          company,
        })
      }
      
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
  }
  
  try {
    switch (type) {
      case 'schema':
        if (!schemasStore.has(id)) {
          return NextResponse.json({ error: 'Schema não encontrado' }, { status: 404 })
        }
        schemasStore.delete(id)
        return NextResponse.json({ success: true, message: 'Schema removido' })
        
      case 'company':
        if (!companiesStore.has(id)) {
          return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
        }
        companiesStore.delete(id)
        return NextResponse.json({ success: true, message: 'Empresa removida' })
        
      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }
  } catch (error) {
    console.error('Erro ao remover configuração:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
