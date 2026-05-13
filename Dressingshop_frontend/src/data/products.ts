export interface Product {
  id: number | string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  occasion: string;
  color: string;
  size: string[];
  rating: number;
  reviews: number;
  reviewEntries?: ReviewEntry[];
  description: string;
  badge?: string;
  isNew?: boolean;
  gender?: 'male' | 'female' | 'unisex' | 'kids';
  garmentType?: 'upper' | 'lower' | 'full' | 'accessory';
  stock?: number;
  sku?: string;
}

export interface ReviewEntry {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export const products: Product[] = [
  {
    id: 1, name: "Kanchipuram Silk Saree - Royal Blue", price: 12999, originalPrice: 18999,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Wedding", color: "Blue", size: ["Free Size"],
    rating: 4.8, reviews: 324, description: "Exquisite Kanchipuram silk saree with intricate zari work and traditional motifs.",
    badge: "Bestseller", isNew: false, gender: 'female', garmentType: 'full',
  },
  {
    id: 2, name: "Banarasi Silk Saree - Maroon Gold", price: 15999, originalPrice: 22999,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Wedding", color: "Maroon", size: ["Free Size"],
    rating: 4.9, reviews: 512, description: "Luxurious Banarasi silk saree with rich gold zari border and pallu.",
    badge: "Premium", isNew: true, gender: 'female', garmentType: 'full',
  },
  {
    id: 3, name: "Designer Lehenga - Bridal Pink", price: 24999, originalPrice: 35999,
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop",
    category: "Lehengas", occasion: "Wedding", color: "Pink", size: ["S", "M", "L", "XL"],
    rating: 4.7, reviews: 189, description: "Stunning bridal lehenga with heavy embroidery and mirror work.",
    badge: "Bridal Collection", gender: 'female', garmentType: 'full',
  },
  {
    id: 4, name: "Silk Kurta Set - Festival Gold", price: 4999, originalPrice: 7999,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    category: "Men", occasion: "Festival", color: "Gold", size: ["S", "M", "L", "XL", "XXL"],
    rating: 4.5, reviews: 267, description: "Premium silk kurta set perfect for festive occasions.",
    gender: 'male', garmentType: 'full',
  },
  {
    id: 5, name: "Cotton Saree - Summer Collection", price: 2999, originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Casual", color: "Green", size: ["Free Size"],
    rating: 4.3, reviews: 445, description: "Lightweight cotton saree perfect for daily wear.",
    gender: 'female', garmentType: 'full',
  },
  {
    id: 6, name: "Anarkali Suit - Royal Purple", price: 8999, originalPrice: 12999,
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop",
    category: "Suits", occasion: "Party", color: "Purple", size: ["S", "M", "L", "XL"],
    rating: 4.6, reviews: 178, description: "Elegant Anarkali suit with flowing silhouette and delicate embroidery.",
    isNew: true, gender: 'female', garmentType: 'full',
  },
  {
    id: 7, name: "Pattu Saree - Temple Border", price: 9999, originalPrice: 14999,
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Festival", color: "Red", size: ["Free Size"],
    rating: 4.7, reviews: 298, description: "Traditional pattu saree with temple border design.",
    badge: "Festival Special", gender: 'female', garmentType: 'full',
  },
  {
    id: 8, name: "Men's Sherwani - Wedding Gold", price: 19999, originalPrice: 29999,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    category: "Men", occasion: "Wedding", color: "Gold", size: ["S", "M", "L", "XL", "XXL"],
    rating: 4.8, reviews: 156, description: "Royal sherwani with heavy embroidery for the perfect wedding look.",
    badge: "Groom's Collection", gender: 'male', garmentType: 'full',
  },
  {
    id: 9, name: "Chiffon Saree - Party Wear", price: 5999, originalPrice: 8999,
    image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Party", color: "Pink", size: ["Free Size"],
    rating: 4.4, reviews: 334, description: "Glamorous chiffon saree with sequin work.",
    gender: 'female', garmentType: 'full',
  },
  {
    id: 10, name: "Kids Lehenga - Little Princess", price: 3999, originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop",
    category: "Kids", occasion: "Festival", color: "Pink", size: ["2-4Y", "4-6Y", "6-8Y"],
    rating: 4.6, reviews: 201, description: "Adorable lehenga set for little princesses.",
    isNew: true, gender: 'kids', garmentType: 'full',
  },
  {
    id: 11, name: "Mysore Silk Saree - Ivory", price: 7999, originalPrice: 11999,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=800&fit=crop",
    category: "Sarees", occasion: "Casual", color: "Cream", size: ["Free Size"],
    rating: 4.5, reviews: 189, description: "Elegant Mysore silk with subtle gold zari work.",
    gender: 'female', garmentType: 'full',
  },
  {
    id: 12, name: "Designer Kurta - Festive Red", price: 3999, originalPrice: 6999,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop",
    category: "Men", occasion: "Festival", color: "Red", size: ["S", "M", "L", "XL"],
    rating: 4.4, reviews: 223, description: "Festive red kurta with traditional block print.",
    gender: 'male', garmentType: 'upper',
  },

  // NEW MEN'S COLLECTION - T-Shirts, Shirts, Baggy Pants
  {
    id: 13, name: "Cotton T-Shirt - Classic Black", price: 799, originalPrice: 1299,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Black", size: ["S", "M", "L", "XL", "XXL"],
    rating: 4.5, reviews: 456, description: "Premium cotton t-shirt with comfortable fit.",
    badge: "Trending", isNew: true, gender: 'male', garmentType: 'upper',
  },
  {
    id: 14, name: "Graphic T-Shirt - Urban Style", price: 999, originalPrice: 1599,
    image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "White", size: ["S", "M", "L", "XL"],
    rating: 4.3, reviews: 328, description: "Trendy graphic tee with modern print.",
    isNew: true, gender: 'male', garmentType: 'upper',
  },
  {
    id: 15, name: "Polo T-Shirt - Navy Blue", price: 1299, originalPrice: 1999,
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Blue", size: ["S", "M", "L", "XL", "XXL"],
    rating: 4.6, reviews: 289, description: "Classic polo with breathable fabric.",
    gender: 'male', garmentType: 'upper',
  },
  {
    id: 16, name: "Formal Shirt - White Oxford", price: 1899, originalPrice: 2999,
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop",
    category: "Men", occasion: "Formal", color: "White", size: ["38", "40", "42", "44"],
    rating: 4.7, reviews: 412, description: "Crisp white oxford shirt for professional look.",
    badge: "Bestseller", gender: 'male', garmentType: 'upper',
  },
  {
    id: 17, name: "Casual Shirt - Checkered Blue", price: 1599, originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Blue", size: ["S", "M", "L", "XL"],
    rating: 4.4, reviews: 267, description: "Comfortable checkered shirt for everyday wear.",
    gender: 'male', garmentType: 'upper',
  },
  {
    id: 18, name: "Linen Shirt - Summer Beige", price: 2199, originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Beige", size: ["S", "M", "L", "XL"],
    rating: 4.5, reviews: 198, description: "Breathable linen shirt perfect for summer.",
    isNew: true, gender: 'male', garmentType: 'upper',
  },
  {
    id: 19, name: "Baggy Cargo Pants - Olive Green", price: 2499, originalPrice: 3999,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Green", size: ["28", "30", "32", "34", "36"],
    rating: 4.6, reviews: 534, description: "Trendy baggy cargo pants with multiple pockets.",
    badge: "Trending", isNew: true, gender: 'male', garmentType: 'lower',
  },
  {
    id: 20, name: "Baggy Jeans - Vintage Blue", price: 2999, originalPrice: 4499,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Blue", size: ["28", "30", "32", "34", "36"],
    rating: 4.7, reviews: 678, description: "Classic baggy fit jeans with vintage wash.",
    badge: "Bestseller", gender: 'male', garmentType: 'lower',
  },
  {
    id: 21, name: "Track Pants - Black Joggers", price: 1499, originalPrice: 2299,
    image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&h=800&fit=crop",
    category: "Men", occasion: "Casual", color: "Black", size: ["S", "M", "L", "XL"],
    rating: 4.4, reviews: 445, description: "Comfortable joggers for casual and athletic wear.",
    gender: 'male', garmentType: 'lower',
  },
  {
    id: 22, name: "Chinos - Slim Fit Khaki", price: 2299, originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop",
    category: "Men", occasion: "Formal", color: "Khaki", size: ["28", "30", "32", "34", "36"],
    rating: 4.5, reviews: 389, description: "Versatile chinos for smart-casual occasions.",
    gender: 'male', garmentType: 'lower',
  },

  // NEW WOMEN'S COLLECTION - Tops, Dresses, Kurtis
  {
    id: 23, name: "Silk Top - Elegant Black", price: 1499, originalPrice: 2499,
    image: "https://www.sujatra.com/cdn/shop/files/0361copy.jpg?v=1736244994&width=1445",
    category: "Women", occasion: "Party", color: "Black", size: ["S", "M", "L", "XL"],
    rating: 4.6, reviews: 312, description: "Luxurious silk top for elegant occasions.",
    badge: "Trending", isNew: true, gender: 'female', garmentType: 'upper',
  },
  {
    id: 24, name: "Cotton Kurti - Floral Print", price: 999, originalPrice: 1699,
    image: "/images/products/women/kurti-floral.svg",
    category: "Women", occasion: "Casual", color: "Pink", size: ["S", "M", "L", "XL", "XXL"],
    rating: 4.4, reviews: 567, description: "Comfortable cotton kurti with beautiful floral print.",
    badge: "Bestseller", gender: 'female', garmentType: 'upper',
  },
  {
    id: 25, name: "Designer Kurti - Ethnic Blue", price: 1799, originalPrice: 2999,
    image: "https://ethnicsuits.in/wp-content/uploads/2024/12/no-name-provided-2-1.webp",
    category: "Women", occasion: "Festival", color: "Blue", size: ["S", "M", "L", "XL"],
    rating: 4.7, reviews: 423, description: "Ethnic designer kurti with embroidery work.",
    isNew: true, gender: 'female', garmentType: 'upper',
  },
  {
    id: 26, name: "Palazzo Set - Comfort Wear", price: 2299, originalPrice: 3499,
    image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=600&h=800&fit=crop",
    category: "Women", occasion: "Casual", color: "Cream", size: ["S", "M", "L", "XL"],
    rating: 4.5, reviews: 298, description: "Comfortable palazzo set for all-day wear.",
    gender: 'female', garmentType: 'full',
  },
  {
    id: 27, name: "Western Dress - Party Red", price: 3499, originalPrice: 5499,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    category: "Women", occasion: "Party", color: "Red", size: ["S", "M", "L", "XL"],
    rating: 4.8, reviews: 445, description: "Stunning western dress for party occasions.",
    badge: "New Arrival", isNew: true, gender: 'female', garmentType: 'full',
  },
  {
    id: 28, name: "Crop Top - Stylish White", price: 899, originalPrice: 1499,
    image: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=800&fit=crop",
    category: "Women", occasion: "Casual", color: "White", size: ["S", "M", "L"],
    rating: 4.3, reviews: 278, description: "Trendy crop top for modern style.",
    badge: "Trending", gender: 'female', garmentType: 'upper',
  },
  {
    id: 29, name: "Maxi Dress - Floral Summer", price: 2799, originalPrice: 4299,
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop",
    category: "Women", occasion: "Casual", color: "Multi", size: ["S", "M", "L", "XL"],
    rating: 4.6, reviews: 356, description: "Beautiful floral maxi dress for summer.",
    isNew: true, gender: 'female', garmentType: 'full',
  },
  {
    id: 30, name: "Denim Jacket - Classic Blue", price: 3299, originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&h=800&fit=crop",
    category: "Women", occasion: "Casual", color: "Blue", size: ["S", "M", "L", "XL"],
    rating: 4.5, reviews: 234, description: "Classic denim jacket for versatile styling.",
    gender: 'female', garmentType: 'upper',
  },
  {
    id: 31, name: "Jumpsuit - Elegant Black", price: 3999, originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&h=800&fit=crop",
    category: "Women", occasion: "Party", color: "Black", size: ["S", "M", "L", "XL"],
    rating: 4.7, reviews: 289, description: "Sophisticated jumpsuit for evening wear.",
    badge: "New Arrival", isNew: true, gender: 'female', garmentType: 'full',
  },
  {
    id: 32, name: "Skirt - Pleated Pink", price: 1799, originalPrice: 2799,
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&h=800&fit=crop",
    category: "Women", occasion: "Casual", color: "Pink", size: ["S", "M", "L", "XL"],
    rating: 4.4, reviews: 198, description: "Feminine pleated skirt for stylish look.",
    gender: 'female', garmentType: 'lower',
  },
];

export const categories = [
  { name: "Silk Sarees", icon: "👘", count: 450, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop" },
  { name: "Lehengas", icon: "👗", count: 280, image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=400&fit=crop" },
  { name: "Men's Wear", icon: "🤵", count: 350, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=400&fit=crop" },
  { name: "Kids Wear", icon: "👶", count: 200, image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=400&h=400&fit=crop" },
  { name: "Suits & Salwars", icon: "💃", count: 320, image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=400&fit=crop" },
  { name: "Accessories", icon: "✨", count: 180, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=400&fit=crop" },
];

export const occasions = [
  { name: "Wedding", image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&h=600&fit=crop", tagline: "Make your special day unforgettable" },
  { name: "Festival", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&h=600&fit=crop", tagline: "Celebrate in style" },
  { name: "Party", image: "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500&h=600&fit=crop", tagline: "Dazzle at every event" },
  { name: "Casual", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=500&h=600&fit=crop", tagline: "Effortless everyday elegance" },
];
