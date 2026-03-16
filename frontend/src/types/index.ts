export interface Category {
  categoryId: string;
  categoryName: string;
  description?: string;
}

export interface Product {
  productId: string;
  productName: string;
  price: number;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  category: Category | null;
}
