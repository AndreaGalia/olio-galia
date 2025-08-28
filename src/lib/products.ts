// lib/products.ts
import productsTemplate from '@/data/products.json'
import type { ProductsData, Product } from '@/types/products'

export function getProducts(): ProductsData {
  // Converti il template JSON sostituendo le variabili
  let productsString = JSON.stringify(productsTemplate)
  
  // Sostituisci tutte le variabili ${VAR_NAME} con i valori process.env
  productsString = productsString.replace(/\$\{([^}]+)\}/g, (match, key) => {
    const value = process.env[key]
    
    // Gestisci casi speciali
    if (value === undefined || value === '') {
      if (key.includes('ORIGINAL_PRICE')) return 'null'
      return match // Mantieni il placeholder se non trovato
    }
    
    return value
  })
  
  return JSON.parse(productsString)
}

// Funzione helper per ottenere un singolo prodotto
export function getProductById(id: string): Product | undefined {
  const { products } = getProducts()
  return products.find(product => product.id === id)
}

// Funzione helper per ottenere prodotti per categoria
export function getProductsByCategory(category: string): Product[] {
  const { products } = getProducts()
  return products.filter(product => product.category === category)
}