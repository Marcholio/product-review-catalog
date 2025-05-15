import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { securityConfig, createRateLimiter } from './config/security.js';
import sequelize from './config/database.js';
import productRoutes from './routes/productRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import userRoutes from './routes/userRoutes.js';
import Product from './models/Product.js';
import Review from './models/Review.js';
import Wishlist from './models/Wishlist.js';
import User from './models/User.js';
import * as helmet from 'helmet';
import { updateAllProductRatings } from './utils/ratingUtils.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'];

(async () => {
  // Dynamic import for helmet
  const helmet = (await import('helmet')).default;
  // Security middleware
  app.use(helmet());

  // Rate limiting - apply different limits to different routes
  // Order matters: specific routes first, then catch-all
  app.use('/api/products', createRateLimiter('productSearch')); // More lenient for product search
  app.use('/api/auth', createRateLimiter('auth')); // Stricter for auth
  
  // Development mode can disable rate limits completely
  if (process.env.NODE_ENV !== 'development' || process.env.ENABLE_RATE_LIMITS === 'true') {
    app.use('/api/', createRateLimiter('default')); // Default for other routes
  }

  // CORS configuration
  app.use(cors(securityConfig.cors));
  app.use(express.json());

  // API Documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Product Review Catalog API Documentation'
  }));

  // Routes
  app.use('/api/products', productRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/users', userRoutes);

  // Basic route for testing
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  // Error handling middleware
  interface ErrorWithStack extends Error {
    stack?: string;
    statusCode?: number;
  }

  app.use((err: ErrorWithStack, req: Request, res: Response, _next: NextFunction) => {
    const statusCode = err.statusCode || 500;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.error(err.stack);
    res.status(statusCode).json({
      error: err.name || 'Internal Server Error',
      message: isDevelopment ? err.message : 'An unexpected error occurred',
      ...(isDevelopment && { stack: err.stack })
    });
  });

  // Seed database with realistic products
  const seedProducts = [
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
    {
      name: "AudioPhile Pro Studio Monitors (Pair)",
      description: "The AudioPhile Pro Studio Monitors are designed for music production, mixing, and mastering. These bi-amped monitors feature 5-inch woofers and 1-inch tweeters, delivering flat frequency response and accurate sound reproduction. Built-in acoustic tuning controls allow you to adjust the sound to your space, while multiple input options provide flexible connectivity. Perfect for home studios and professional setups alike.",
      price: 349.99,
      imageUrl: "https://images.unsplash.com/photo-1595432541891-a461100d3054?w=600&auto=format",
      category: "Audio"
    },
    {
      name: "VinylMaster Record Player with Bluetooth",
      description: "Experience the warm sound of vinyl with modern convenience. The VinylMaster Record Player plays your favorite albums with a high-quality Audio-Technica cartridge and adjustable counterweight. It also connects via Bluetooth to your wireless speakers or streams your vinyl to Bluetooth headphones. The built-in preamp and USB output allow for direct connection to powered speakers or digitizing your collection.",
      price: 199.99,
      imageUrl: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format",
      category: "Audio"
    },
    {
      name: "BoomBox Retro Portable Radio",
      description: "The BoomBox Retro combines vintage style with modern technology. This portable radio features FM/AM reception, Bluetooth streaming, USB playback, and a CD player. The powerful stereo speakers and bass radiator deliver room-filling sound, while the rechargeable battery provides up to 12 hours of playback. Perfect for backyard parties, beach trips, or just enjoying music around the house.",
      price: 89.99,
      imageUrl: "https://images.unsplash.com/photo-1518911710364-17ec553bde5d?w=600&auto=format",
      category: "Audio"
    },
    
    // Wearables Category
    {
      name: "TechFit Pro 5 Smartwatch",
      description: "The TechFit Pro 5 is the ultimate fitness and lifestyle companion. This advanced smartwatch features continuous heart rate monitoring, ECG capabilities, sleep tracking, and over 120 workout modes. The always-on AMOLED display is visible in any lighting condition, while the 7-day battery life keeps you going without frequent charges. Stay connected with notifications, calls, and mobile payments.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&auto=format",
      category: "Wearables"
    },
    {
      name: "FitTrack Ultra Smart Fitness Band",
      description: "Track your health and fitness goals with the FitTrack Ultra. This slim, comfortable fitness band monitors steps, distance, calories burned, heart rate, and sleep quality. The waterproof design means you can wear it while swimming or showering, and the 15-day battery life ensures you're never without your health data. Sync with the FitTrack app to access detailed insights and personalized coaching.",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd1ee?w=600&auto=format",
      category: "Wearables"
    },
    {
      name: "SleepRight Smart Sleep Tracking Ring",
      description: "Understand and improve your sleep with the SleepRight Ring. This lightweight, comfortable ring tracks your sleep stages, heart rate, body temperature, and blood oxygen levels throughout the night. The accompanying app provides personalized insights and recommendations to help you achieve better sleep quality. With a 7-day battery life and waterproof design, it's easy to integrate into your daily routine.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1568745376250-705d921a3d02?w=600&auto=format",
      category: "Wearables"
    },
    {
      name: "ActiveBuds Sport Wireless Earphones",
      description: "Designed for athletes and fitness enthusiasts, ActiveBuds Sport wireless earphones stay securely in place during even the most intense workouts. The sweat and water-resistant design (IPX7 rated) can handle any conditions, while the 9-hour battery life keeps your music playing through multiple workouts. Features include ambient awareness mode for outdoor safety and customizable EQ settings for perfect sound.",
      price: 119.99,
      imageUrl: "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?w=600&auto=format",
      category: "Wearables"
    },
    {
      name: "OptiView Smart Glasses",
      description: "Experience augmented reality with OptiView Smart Glasses. These lightweight glasses overlay digital information on the world around you, providing navigation directions, notifications, and hands-free communication. The built-in camera lets you capture photos and videos from your perspective, while voice commands make operation intuitive. Perfect for tech enthusiasts and early adopters.",
      price: 499.99,
      imageUrl: "https://images.unsplash.com/photo-1629948618343-0d33f97560d2?w=600&auto=format",
      category: "Wearables"
    },
    
    // Computers Category
    {
      name: "UltraBook Pro 15\" Laptop",
      description: "The UltraBook Pro combines power and portability in a premium package. This 15-inch laptop features a stunning 4K OLED display, the latest 12th Gen Intel i9 processor, 32GB of RAM, and 1TB SSD storage. The all-day battery life, backlit keyboard, and precision trackpad make it perfect for professionals and creators. The machined aluminum chassis is both durable and beautiful.",
      price: 1899.99,
      imageUrl: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?w=600&auto=format",
      category: "Computers"
    },
    {
      name: "PowerStation X Gaming Desktop",
      description: "Dominate your games with the PowerStation X. This high-performance gaming desktop features an AMD Ryzen 9 processor, NVIDIA RTX 3080 graphics card, 32GB of DDR5 RAM, and lightning-fast NVMe storage. The custom cooling system keeps temperatures low even during intense gaming sessions, while the RGB lighting adds style to your setup. Includes a gaming keyboard and mouse to get you started right away.",
      price: 2499.99,
      imageUrl: "https://images.unsplash.com/photo-1624705230144-fe3e9aa9a5ed?w=600&auto=format",
      category: "Computers"
    },
    {
      name: "DesignPro 27\" 5K Monitor",
      description: "See your work in incredible detail with the DesignPro 27\" Monitor. This professional-grade display features 5K resolution, 99% Adobe RGB color coverage, and factory color calibration for accurate color reproduction. The anti-glare coating and adjustable stand ensure comfort during long work sessions. Connect via USB-C for video, data, and power with a single cable.",
      price: 899.99,
      imageUrl: "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&auto=format",
      category: "Computers"
    },
    {
      name: "TouchPad Pro Drawing Tablet",
      description: "Unleash your creativity with the TouchPad Pro Drawing Tablet. This professional-grade tablet features 8192 levels of pressure sensitivity, tilt recognition, and a laminated display for a natural drawing experience. The 13-inch 4K display shows your work in vibrant detail, while the programmable express keys speed up your workflow. Compatible with all major creative software.",
      price: 749.99,
      imageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&auto=format",
      category: "Computers"
    },
    {
      name: "NetGuard Pro VPN Router",
      description: "Protect your home network with the NetGuard Pro VPN Router. This advanced router features built-in VPN service, malware protection, and parental controls. The tri-band WiFi 6 technology provides fast, reliable connections for all your devices, while the mesh capability allows for whole-home coverage. Setup is simple with the intuitive app, and automatic updates keep your security current.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format",
      category: "Computers"
    },
    
    // Gaming Category
    {
      name: "GameSphere X Console",
      description: "The GameSphere X delivers next-generation gaming performance in a compact package. Featuring a custom AMD processor, ray-tracing capable graphics, and high-speed SSD storage, it loads games in seconds and renders them in stunning 4K resolution at up to 120fps. The included wireless controller features adaptive triggers and haptic feedback for immersive gameplay. Backward compatibility lets you play your existing game library.",
      price: 499.99,
      imageUrl: "https://images.unsplash.com/photo-1486572788966-cfd3df1f5b42?w=600&auto=format",
      category: "Gaming"
    },
    {
      name: "ProController Elite Wireless",
      description: "Take your gaming to the next level with the ProController Elite. This premium wireless controller features customizable paddles, adjustable trigger stops, and interchangeable thumbsticks for a personalized experience. The rechargeable battery provides up to 40 hours of gameplay, while the Bluetooth connectivity allows use with consoles, PCs, and mobile devices. The app lets you create and save multiple button profiles.",
      price: 149.99,
      imageUrl: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600&auto=format",
      category: "Gaming"
    },
    {
      name: "VRPro Immersive Headset",
      description: "Experience virtual reality like never before with the VRPro Immersive Headset. The high-resolution displays and wide field of view create a truly immersive experience, while the precise tracking allows for natural movement in virtual spaces. The comfortable design features adjustable head straps and built-in audio for long gaming sessions. Compatible with PC and standalone use.",
      price: 599.99,
      imageUrl: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&auto=format",
      category: "Gaming"
    },
    {
      name: "GameStation Portable",
      description: "Gaming on the go has never been better than with the GameStation Portable. This handheld gaming device features a 7-inch OLED screen, powerful custom processor, and versatile controls for any game type. Play your PC game library anywhere, connect to a TV when at home, or enjoy the extensive library of optimized portable games. The 6-hour battery life ensures gaming through long trips.",
      price: 349.99,
      imageUrl: "https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&auto=format",
      category: "Gaming"
    },
    {
      name: "RacePro Steering Wheel & Pedals",
      description: "Transform your racing games into a realistic driving experience with the RacePro Steering Wheel and Pedals. The force feedback motor provides realistic resistance, while the 900-degree rotation mimics real vehicles. The three-pedal set features progressive brake resistance for precise control. Compatible with all major racing games on PC and consoles, this set will improve your lap times and immersion.",
      price: 249.99,
      imageUrl: "https://images.unsplash.com/photo-1595326973457-d267dfb5ee7f?w=600&auto=format",
      category: "Gaming"
    },
    
    // Home Category
    {
      name: "SmartHome Hub Controller",
      description: "Control your entire smart home from one device with the SmartHome Hub. This central controller connects to your WiFi network and manages your smart lights, thermostats, locks, cameras, and more. The touchscreen interface provides quick access to common functions, while voice control and smartphone app offer flexibility. Compatible with all major smart home ecosystems including Alexa, Google Home, and HomeKit.",
      price: 149.99,
      imageUrl: "https://images.unsplash.com/photo-1563207153-f403bf289096?w=600&auto=format",
      category: "Home"
    },
    {
      name: "AirPure 5000 Smart Air Purifier",
      description: "Breathe cleaner air with the AirPure 5000. This smart air purifier features a true HEPA filter that removes 99.97% of particles as small as 0.3 microns, including allergens, dust, and smoke. The activated carbon filter eliminates odors, while UV-C light helps kill bacteria and viruses. The smart sensors automatically adjust fan speed based on air quality, and the app allows for remote monitoring and control.",
      price: 299.99,
      imageUrl: "https://images.unsplash.com/photo-1585157603791-01dfa544807e?w=600&auto=format",
      category: "Home"
    },
    {
      name: "VacuMaster Robot Vacuum & Mop",
      description: "Keep your floors clean without lifting a finger. The VacuMaster Robot Vacuum and Mop combines powerful suction with intelligent navigation to clean your entire home efficiently. The advanced LIDAR system creates accurate maps, while multiple sensors prevent falls and collisions. Schedule cleanings, set no-go zones, and monitor progress through the app. The self-emptying base holds up to 60 days of dirt.",
      price: 499.99,
      imageUrl: "https://images.unsplash.com/photo-1567690187548-f07b1d7bf5a9?w=600&auto=format",
      category: "Home"
    },
    {
      name: "LightMaster Smart Bulb Kit (4 Pack)",
      description: "Transform your home lighting with the LightMaster Smart Bulb Kit. These color-changing LED bulbs can be adjusted to any color or white temperature using the app or voice commands. Set up routines for automatic lighting changes, sync with music or movies for immersive effects, or use the vacation mode for added security. Each bulb lasts up to 25,000 hours and uses minimal energy.",
      price: 99.99,
      imageUrl: "https://images.unsplash.com/photo-1533729104510-75364a3171c8?w=600&auto=format",
      category: "Home"
    },
    {
      name: "ClimateControl Smart Thermostat",
      description: "The ClimateControl Smart Thermostat helps you maintain perfect comfort while saving energy. Learning your schedule and preferences, it automatically adjusts temperature for optimal efficiency. Remote sensors ensure even temperatures throughout your home, while intelligent features like geofencing adjust settings when you leave or return. The easy-to-use interface and smartphone control make temperature management simple.",
      price: 179.99,
      imageUrl: "https://images.unsplash.com/photo-1605108143465-4b1d1ad633cf?w=600&auto=format",
      category: "Home"
    },
    
    // Kitchen Category
    {
      name: "ChefPro 10-in-1 Multi-Cooker",
      description: "The ChefPro Multi-Cooker replaces 10 kitchen appliances with one versatile device. Functions include pressure cooking, slow cooking, sautéing, steaming, rice cooking, yogurt making, and more. The 6-quart capacity feeds up to 8 people, while the stainless steel inner pot ensures durability and easy cleaning. Included accessories and a recipe book help you get started with this kitchen essential.",
      price: 129.99,
      imageUrl: "https://images.unsplash.com/photo-1596466713836-24598ab9474c?w=600&auto=format",
      category: "Kitchen"
    },
    {
      name: "BrewMaster Pro Coffee System",
      description: "Craft the perfect cup of coffee with the BrewMaster Pro. This premium coffee maker features precision temperature control, programmable brewing profiles, and a built-in burr grinder for the freshest coffee. Choose from single cups to full carafes, and enjoy features like pre-infusion for optimal flavor extraction. The thermal carafe keeps coffee hot for hours without a warming plate that can burn the flavor.",
      price: 249.99,
      imageUrl: "https://images.unsplash.com/photo-1606937311321-33c4fbcf8add?w=600&auto=format",
      category: "Kitchen"
    },
    {
      name: "NutriBlend Professional Blender",
      description: "The NutriBlend Professional is powerful enough for the most demanding blending tasks. The 1500-watt motor and hardened stainless steel blades pulverize ingredients for silky smoothies, hot soups, nut butters, and more. The variable speed control and preset programs provide versatility, while the 64-ounce BPA-free container is perfect for family-sized batches. Includes a tamper tool and recipe book.",
      price: 199.99,
      imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format",
      category: "Kitchen"
    },
    {
      name: "SmartOven Air Fryer Convection Oven",
      description: "The SmartOven combines air frying, convection baking, and toasting in one countertop appliance. With 12 preset cooking functions and a large capacity that fits a 13\" pizza or a whole chicken, it handles most cooking tasks. The digital display and intuitive controls make operation simple, while the air frying function creates crispy results with little to no oil. Even heating ensures consistent results every time.",
      price: 179.99,
      imageUrl: "https://images.unsplash.com/photo-1585325701163-641f1f4f1dc7?w=600&auto=format",
      category: "Kitchen"
    },
    {
      name: "PrecisionChef Smart Food Scale",
      description: "Achieve perfect results in your cooking and baking with the PrecisionChef Smart Scale. This high-precision scale measures ingredients with accuracy down to 0.1 gram and connects to an app with thousands of recipes that automatically adjust to your desired serving size. The nutrition calculation feature helps with dietary tracking, while the sleek, stain-resistant design looks great in any kitchen.",
      price: 49.99,
      imageUrl: "https://images.unsplash.com/photo-1558610263-5c5c2b72e3a8?w=600&auto=format",
      category: "Kitchen"
    },
    
    // Sports Category
    {
      name: "TrailMaster Pro Hiking Backpack 65L",
      description: "The TrailMaster Pro is designed for serious hikers and backpackers. This 65-liter pack features an adjustable suspension system, ventilated back panel, and balanced load distribution for comfortable carrying. Multiple compartments, external attachment points, and a hydration reservoir sleeve keep your gear organized, while the waterproof construction and included rain cover protect your equipment in any weather.",
      price: 189.99,
      imageUrl: "https://images.unsplash.com/photo-1550765515-40ea3ab43428?w=600&auto=format",
      category: "Sports"
    },
    {
      name: "FitTrack Performance Running Shoes",
      description: "Engineered for speed and comfort, FitTrack Performance Running Shoes feature responsive cushioning, a breathable knit upper, and a carbon fiber plate for energy return with each stride. The lightweight design (just 8.2 oz) reduces fatigue during long runs, while the durable rubber outsole provides excellent traction on varied surfaces. Available in men's and women's sizes with multiple width options.",
      price: 149.99,
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format",
      category: "Sports"
    },
    {
      name: "AllTerrain Mountain Bike",
      description: "Conquer any trail with the AllTerrain Mountain Bike. This full-suspension mountain bike features a lightweight aluminum frame, hydraulic disc brakes, and a 1x12 drivetrain for simplified shifting. The 29-inch wheels roll smoothly over obstacles, while the adjustable suspension adapts to different terrain. Whether you're a weekend warrior or serious trail rider, this bike delivers performance and reliability.",
      price: 999.99,
      imageUrl: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600&auto=format",
      category: "Sports"
    },
    {
      name: "PowerLift Home Gym System",
      description: "Build strength without leaving home with the PowerLift Home Gym System. This compact, versatile machine allows for over 50 exercises targeting all major muscle groups. The adjustable weight stack goes from 5 to 200 pounds, accommodating beginners and experienced lifters alike. The included workout guide and online video library help you design an effective routine for your fitness goals.",
      price: 799.99,
      imageUrl: "https://images.unsplash.com/photo-1582388690333-31e3e0c66a31?w=600&auto=format",
      category: "Sports"
    },
    {
      name: "AquaGlide Inflatable Stand-Up Paddleboard",
      description: "Experience the joy of paddleboarding anywhere with the AquaGlide Inflatable SUP. This stable, durable board inflates in minutes to a rigid 10'6\" paddleboard, then deflates and rolls up for easy transport and storage. The complete package includes an adjustable paddle, high-pressure pump, backpack, and repair kit. Perfect for lakes, rivers, and even light ocean conditions.",
      price: 399.99,
      imageUrl: "https://images.unsplash.com/photo-1526002088830-5e918c646152?w=600&auto=format",
      category: "Sports"
    },
    
    // Fashion Category
    {
      name: "Elements Weatherproof Jacket",
      description: "Face any forecast with confidence in the Elements Weatherproof Jacket. This versatile 3-in-1 jacket features a waterproof, breathable outer shell and a removable insulated liner that can be worn separately or together. The adjustable hood, water-resistant zippers, and sealed seams keep you dry in heavy rain, while reflective details enhance visibility in low light conditions.",
      price: 199.99,
      imageUrl: "https://images.unsplash.com/photo-1545118165-8b1d600370fe?w=600&auto=format",
      category: "Fashion"
    },
    {
      name: "EcoTrend Recycled Travel Backpack",
      description: "The EcoTrend Travel Backpack combines sustainability with functional design. Made from recycled ocean plastic, this backpack features a laptop compartment, expandable water bottle pocket, and hidden security pocket. The comfortable straps and back panel make it ideal for daily commutes or weekend trips, while the water-resistant construction protects your belongings. Available in multiple earth-tone colors.",
      price: 89.99,
      imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600&auto=format",
      category: "Fashion"
    },
    {
      name: "LuxeLeather Minimalist Wallet",
      description: "The LuxeLeather Minimalist Wallet offers classic style with modern functionality. Crafted from premium full-grain leather that develops a beautiful patina over time, this slim wallet holds up to 8 cards and includes a secure money clip for cash. RFID blocking technology protects your card information, while the compact design fits comfortably in front pockets. Available in brown, black, and navy.",
      price: 49.99,
      imageUrl: "https://images.unsplash.com/photo-1585565804747-10a5c6f5e005?w=600&auto=format",
      category: "Fashion"
    },
    {
      name: "SilverShine Automatic Watch",
      description: "The SilverShine Automatic Watch combines timeless design with precision engineering. The self-winding mechanical movement never needs a battery, while the sapphire crystal resists scratches. Features include a date display, 100-meter water resistance, and luminous hands for low-light visibility. The stainless steel case and bracelet provide durability and style for daily wear or special occasions.",
      price: 349.99,
      imageUrl: "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&auto=format",
      category: "Fashion"
    },
    {
      name: "ComfortStep Ergonomic Dress Shoes",
      description: "Experience all-day comfort without sacrificing style with ComfortStep Ergonomic Dress Shoes. These innovative shoes feature memory foam insoles, arch support, and shock-absorbing heel cushions. The premium leather upper provides a professional appearance, while the flexible construction mimics natural foot movement. Ideal for office wear, special events, or any occasion that requires both elegance and comfort.",
      price: 129.99,
      imageUrl: "https://images.unsplash.com/photo-1531310197839-ccf54634509e?w=600&auto=format",
      category: "Fashion"
    },
    
    // Books Category
    {
      name: "The Innovation Mindset: Thinking Like a Creator",
      description: "In 'The Innovation Mindset,' renowned business psychologist Dr. Rebecca Chen explores the thought patterns and habits that lead to breakthrough ideas. Through case studies, exercises, and practical advice, readers learn how to overcome creative blocks, develop curiosity, and transform challenges into opportunities for innovation. This bestselling guide has been translated into 12 languages and adopted by leading companies worldwide.",
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format",
      category: "Books"
    },
    {
      name: "Digital Minimalism: Finding Balance in a Connected World",
      description: "Technology expert James Foster presents a thoughtful approach to technology use in 'Digital Minimalism.' This practical guide helps readers assess their digital habits, identify meaningful online activities, and create healthy boundaries with devices and social media. Learn how to reclaim your attention, deepen real-world relationships, and use technology intentionally to support your values and goals.",
      price: 19.99,
      imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format",
      category: "Books"
    },
    {
      name: "The Complete Chef: Master the Fundamentals",
      description: "From professional chefs Maria Gonzalez and David Park comes the definitive guide to cooking techniques. 'The Complete Chef' covers everything from knife skills and ingredient selection to advanced methods like sous vide and fermentation. With over 100 foundational recipes, step-by-step photography, and clear explanations of the science behind cooking, this comprehensive resource is perfect for beginners and experienced home cooks alike.",
      price: 39.99,
      imageUrl: "https://images.unsplash.com/photo-1594312915251-48db9280c8f1?w=600&auto=format",
      category: "Books"
    },
    {
      name: "Beyond Earth: The Future of Space Exploration",
      description: "Astrophysicist Dr. Neil Hammond takes readers on a journey through our solar system and beyond in this captivating exploration of space science. 'Beyond Earth' examines current missions, emerging technologies, and the potential for human settlement on other planets. With stunning images from space telescopes and probes, this coffee table book inspires wonder while providing accurate, accessible explanations of complex astronomical concepts.",
      price: 49.99,
      imageUrl: "https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=600&auto=format",
      category: "Books"
    },
    {
      name: "Mindful Living: A 30-Day Guide to Presence and Peace",
      description: "Meditation teacher and psychologist Dr. Sarah Lin shares practical mindfulness techniques in this interactive workbook. 'Mindful Living' provides daily exercises, reflection prompts, and guided practices to reduce stress, improve focus, and cultivate compassion. The science-based approach makes mindfulness accessible to everyone, regardless of experience level, and helps readers integrate presence into everyday activities.",
      price: 18.99,
      imageUrl: "https://images.unsplash.com/photo-1518893494013-481c1d8ed3fd?w=600&auto=format",
      category: "Books"
    }
  ];

  const seedDatabase = async () => {
    try {
      // Check if products already exist
      const productCount = await Product.count();
      if (productCount > 0) {
        console.log('Database already has products. Skipping seed.');
        return;
      }

      // Add seed products to database
      await Product.bulkCreate(seedProducts);
      console.log(`${seedProducts.length} sample products added to database`);
      
      // Add some random reviews to products
      const reviewsToCreate = [];
      const userNames = ["Alex Johnson", "Maria Garcia", "Jamal Wilson", "Sarah Chen", "Michael Brown", "Emma Davis", "David Kim", "Olivia Martinez", "James Smith", "Sofia Patel"];
      
      // For each product, create 0-5 random reviews
      for (const product of seedProducts) {
        const reviewCount = Math.floor(Math.random() * 6); // 0 to 5 reviews per product
        for (let i = 0; i < reviewCount; i++) {
          const productId = (await Product.findOne({ where: { name: product.name } }))?.id;
          if (productId) {
            const rating = Math.floor(Math.random() * 5) + 1; // 1 to 5 stars
            const userName = userNames[Math.floor(Math.random() * userNames.length)];
            
            let comment;
            if (rating >= 4) {
              comment = `Really impressed with this ${product.category.toLowerCase()} product. ${Math.random() > 0.5 ? 'The quality is outstanding and it works exactly as described.' : 'Exceeded my expectations in terms of performance and design.'}`;
            } else if (rating === 3) {
              comment = `Decent ${product.category.toLowerCase()} item. ${Math.random() > 0.5 ? 'Does what it claims, but nothing extraordinary.' : 'Satisfactory performance, though there\'s room for improvement.'}`;
            } else {
              comment = `Disappointed with this purchase. ${Math.random() > 0.5 ? 'The quality doesn\'t match the price point.' : 'Had some issues with functionality that should be addressed.'}`;
            }
            
            reviewsToCreate.push({
              productId,
              userName,
              rating,
              comment,
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)) // Random date in last 90 days
            });
          }
        }
      }
      
      if (reviewsToCreate.length > 0) {
        await Review.bulkCreate(reviewsToCreate);
        console.log(`${reviewsToCreate.length} sample reviews added to database`);
        
        // Update all product ratings using the utility function
        await updateAllProductRatings();
        console.log('Product ratings updated based on reviews');
      }
      
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  // Database connection and server start
  const startServer = async (): Promise<void> => {
    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      
      // Sync database (in development)
      if (process.env.NODE_ENV !== 'production') {
        const shouldForceSync = process.env.FORCE_SYNC === 'true';
        await sequelize.sync({ force: shouldForceSync });
        console.log('Database synced' + (shouldForceSync ? ' with force' : ''));
        
        // Only seed if explicitly enabled or no products exist
        const shouldSeed = process.env.SEED_DATABASE === 'true';
        const productCount = await Product.count();
        if (shouldSeed || productCount === 0) {
          await seedDatabase();
        }
      }

      app.listen(port, () => {
        console.log(`Server running on port ${port}`);
      });
    } catch (error) {
      console.error('Unable to start server:', error);
      process.exit(1);
    }
  };

  await startServer();
})(); 