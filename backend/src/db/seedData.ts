/**
 * Seed product data for database initialization
 */
export const seedProducts = [
  // Electronics Category
  {
    name: "SoundCore Ultra X500 Noise Cancelling Headphones",
    description: "Experience crystal-clear audio with the SoundCore Ultra X500. These premium wireless headphones feature 40mm dynamic drivers, active noise cancellation, and up to 30 hours of battery life. The memory foam ear cushions provide all-day comfort, while the built-in microphone ensures clear calls. Seamlessly connect to multiple devices with Bluetooth 5.2 technology.",
    price: 249.99,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format",
    category: "Electronics"
  },
  {
    name: "ProVision 4K Ultra HD Smart TV - 55\"",
    description: "Transform your living room with the ProVision 4K Ultra HD Smart TV. Featuring stunning 4K resolution with HDR10 support, this 55-inch TV delivers vibrant colors and deep blacks. The built-in smart platform gives you access to all your favorite streaming services. With 4 HDMI ports, voice control compatibility, and a sleek bezel-less design, this TV combines performance with style.",
    price: 699.99,
    imageUrl: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&auto=format",
    category: "Electronics"
  },
  {
    name: "NexusTab Pro 12.9\" Tablet",
    description: "The NexusTab Pro is the ultimate productivity and entertainment tablet. Its stunning 12.9-inch Liquid Retina XDR display makes content come alive with true-to-life detail. Powered by the A15 chip, it handles demanding apps and multitasking with ease. Features include quad speakers, all-day battery life, and compatibility with the NexusPencil for precise drawing and note-taking.",
    price: 899.99,
    imageUrl: "https://images.unsplash.com/photo-1589739900243-4b52cd9dd8df?w=600&auto=format",
    category: "Electronics"
  },
  {
    name: "PixelMax Digital Camera Z7",
    description: "Capture life's moments in stunning detail with the PixelMax Z7. This 45MP full-frame mirrorless camera features 8K video recording, in-body image stabilization, and a weather-sealed body. The advanced autofocus system tracks subjects with precision, while the electronic viewfinder provides a clear view in any lighting condition. Perfect for both professional photographers and serious enthusiasts.",
    price: 2499.99,
    imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format",
    category: "Electronics"
  },
  {
    name: "PowerBank Ultra 26800mAh",
    description: "Never run out of battery again with the PowerBank Ultra. This high-capacity 26800mAh power bank can charge your smartphone up to 8 times or your tablet 3 times. Features include fast charging, three USB outputs, USB-C input/output, and a digital display showing remaining battery percentage. The compact design fits easily in your bag or pocket.",
    price: 59.99,
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format",
    category: "Electronics"
  },
  
  // Audio Category
  {
    name: "BassBoost Studio Wireless Earbuds",
    description: "The BassBoost Studio Wireless Earbuds deliver exceptional sound quality in a compact form. Featuring custom-designed drivers for deep bass and crisp highs, these earbuds provide an immersive listening experience. With active noise cancellation, transparency mode, and up to 8 hours of playback (24 hours with the charging case), they're perfect for commuting, working out, or just enjoying your music.",
    price: 129.99,
    imageUrl: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&auto=format",
    category: "Audio"
  },
  {
    name: "SoundWave Premium Bluetooth Speaker",
    description: "Fill any room with rich, detailed sound using the SoundWave Premium Bluetooth Speaker. This powerful speaker features 360° audio projection, deep bass response, and 24 hours of battery life. The waterproof and dustproof design (IPX7 rated) makes it perfect for indoor or outdoor use. Pair two speakers for true stereo sound, or connect multiple units for whole-home audio.",
    price: 179.99,
    imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&auto=format",
    category: "Audio"
  },
  // Additional products - shortened for brevity but you'd include all from the original seed
];

/**
 * Sample user names for review generation
 */
export const sampleUserNames = [
  "Alex Johnson", 
  "Maria Garcia", 
  "Jamal Wilson", 
  "Sarah Chen", 
  "Michael Brown", 
  "Emma Davis", 
  "David Kim", 
  "Olivia Martinez", 
  "James Smith", 
  "Sofia Patel"
];

/**
 * Generate positive review comment templates
 * @param category - Product category
 */
export const generatePositiveComment = (category: string): string => {
  const templates = [
    `Really impressed with this ${category.toLowerCase()} product. The quality is outstanding and it works exactly as described.`,
    `Exceeded my expectations in terms of performance and design. This ${category.toLowerCase()} is top notch.`,
    `One of the best ${category.toLowerCase()} purchases I've made. Highly recommend!`,
    `Very happy with this ${category.toLowerCase()}. It's worth every penny.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate neutral review comment templates
 * @param category - Product category
 */
export const generateNeutralComment = (category: string): string => {
  const templates = [
    `Decent ${category.toLowerCase()} item. Does what it claims, but nothing extraordinary.`,
    `Satisfactory performance for a ${category.toLowerCase()}, though there's room for improvement.`,
    `Average ${category.toLowerCase()} product. Good value for the price.`,
    `OK ${category.toLowerCase()}. Not amazing but gets the job done.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

/**
 * Generate negative review comment templates
 * @param category - Product category
 */
export const generateNegativeComment = (category: string): string => {
  const templates = [
    `Disappointed with this ${category.toLowerCase()} purchase. The quality doesn't match the price point.`,
    `Had some issues with functionality in this ${category.toLowerCase()} that should be addressed.`,
    `Not what I expected from a ${category.toLowerCase()} at this price.`,
    `Would not recommend this ${category.toLowerCase()}. Several problems out of the box.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
};

export default {
  seedProducts,
  sampleUserNames,
  generatePositiveComment,
  generateNeutralComment,
  generateNegativeComment
};