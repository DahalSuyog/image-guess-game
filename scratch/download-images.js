const fs = require('fs');
const path = require('path');
const https = require('https');

const imageList = [
  {
    id: "01",
    name: "Eiffel Tower",
    answers: ["Eiffel Tower", "Tour Eiffel", "Paris Tower"],
    category: "Landmark",
    difficulty: "easy",
    hint: "Built in 1889 for a World's Fair in Paris",
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "02",
    name: "Taj Mahal",
    answers: ["Taj Mahal", "Tajmahal"],
    category: "Landmark",
    difficulty: "easy",
    hint: "A white marble mausoleum in Agra, India",
    url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "03",
    name: "Golden Gate Bridge",
    answers: ["Golden Gate Bridge", "Golden Gate"],
    category: "Landmark",
    difficulty: "easy",
    hint: "Famous orange suspension bridge in San Francisco",
    url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "04",
    name: "Colosseum",
    answers: ["Colosseum", "Colosseum Rome", "Flavian Amphitheatre"],
    category: "Landmark",
    difficulty: "easy",
    hint: "An ancient amphitheater in the center of Rome",
    url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "05",
    name: "Statue of Liberty",
    answers: ["Statue of Liberty", "Lady Liberty"],
    category: "Landmark",
    difficulty: "easy",
    hint: "A colossal sculpture on Liberty Island in New York Harbor",
    url: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "06",
    name: "Great Wall of China",
    answers: ["Great Wall of China", "Great Wall", "China Wall"],
    category: "Landmark",
    difficulty: "easy",
    hint: "Ancient fortification winding across northern China",
    url: "https://images.unsplash.com/photo-1547829470-40385fd1ad4b?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "07",
    name: "Pyramids of Giza",
    answers: ["Pyramids of Giza", "Pyramids", "Giza Pyramids", "Egyptian Pyramids"],
    category: "Landmark",
    difficulty: "medium",
    hint: "Ancient royal tombs located on the outskirts of Cairo",
    url: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "08",
    name: "Sydney Opera House",
    answers: ["Sydney Opera House", "Opera House"],
    category: "Landmark",
    difficulty: "easy",
    hint: "Multi-venue performing arts centre in Sydney Harbour",
    url: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "09",
    name: "Mount Fuji",
    answers: ["Mount Fuji", "Mt Fuji", "Fuji"],
    category: "Landmark",
    difficulty: "medium",
    hint: "Active stratovolcano and the tallest mountain in Japan",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "10",
    name: "Big Ben",
    answers: ["Big Ben", "Elizabeth Tower", "Clock Tower London"],
    category: "Landmark",
    difficulty: "easy",
    hint: "The iconic clock tower at the north end of the Houses of Parliament in London",
    url: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "11",
    name: "Lion",
    answers: ["Lion", "Lions"],
    category: "Animal",
    difficulty: "easy",
    hint: "Known as the king of the jungle",
    url: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "12",
    name: "Tiger",
    answers: ["Tiger", "Tigers"],
    category: "Animal",
    difficulty: "easy",
    hint: "The largest living cat species, striped in orange and black",
    url: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "13",
    name: "Elephant",
    answers: ["Elephant", "Elephants"],
    category: "Animal",
    difficulty: "easy",
    hint: "The largest land animal, possessing a trunk and tusks",
    url: "https://images.unsplash.com/photo-1581850518616-bcb8077fa212?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "14",
    name: "Giraffe",
    answers: ["Giraffe", "Giraffes"],
    category: "Animal",
    difficulty: "easy",
    hint: "The tallest living terrestrial animal, known for its long neck",
    url: "https://images.unsplash.com/photo-1547721064-da6cfb341d50?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "15",
    name: "Penguin",
    answers: ["Penguin", "Penguins"],
    category: "Animal",
    difficulty: "easy",
    hint: "Flightless aquatic bird living almost exclusively in the Southern Hemisphere",
    url: "https://images.unsplash.com/photo-1574870111867-089730e5a72b?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "16",
    name: "Kangaroo",
    answers: ["Kangaroo", "Kangaroos"],
    category: "Animal",
    difficulty: "easy",
    hint: "Large marsupial native to Australia, famous for hopping",
    url: "https://images.unsplash.com/photo-1549281899-f75600a24107?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "17",
    name: "Zebra",
    answers: ["Zebra", "Zebras"],
    category: "Animal",
    difficulty: "easy",
    hint: "African wild horse with black-and-white stripes",
    url: "https://images.unsplash.com/photo-1501705388883-4ed8a543392c?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "18",
    name: "Panda",
    answers: ["Panda", "Giant Panda", "Pandas"],
    category: "Animal",
    difficulty: "easy",
    hint: "Bear native to China, with black patches around its eyes and ears",
    url: "https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "19",
    name: "Sunflower",
    answers: ["Sunflower", "Sunflowers"],
    category: "Plant",
    difficulty: "easy",
    hint: "Tall yellow flower that turns towards the sun",
    url: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "20",
    name: "Rose",
    answers: ["Rose", "Roses", "Red Rose"],
    category: "Plant",
    difficulty: "easy",
    hint: "Classic flower of love, often red with thorns on its stem",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "21",
    name: "Pizza",
    answers: ["Pizza", "Pizzas"],
    category: "Food",
    difficulty: "easy",
    hint: "Italian dish consisting of a flat round base of dough with toppings",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "22",
    name: "Burger",
    answers: ["Burger", "Hamburger", "Cheeseburger", "Burgers"],
    category: "Food",
    difficulty: "easy",
    hint: "Patty of ground meat inside a sliced bun",
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "23",
    name: "Sushi",
    answers: ["Sushi", "Sushi roll"],
    category: "Food",
    difficulty: "medium",
    hint: "Japanese dish of prepared vinegared rice and raw seafood",
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "24",
    name: "Coffee",
    answers: ["Coffee", "Coffee cup", "Espresso", "Latte"],
    category: "Food",
    difficulty: "easy",
    hint: "Popular morning caffeinated beverage made from roasted beans",
    url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "25",
    name: "Guitar",
    answers: ["Guitar", "Acoustic Guitar", "Electric Guitar"],
    category: "Object",
    difficulty: "easy",
    hint: "Six-stringed musical instrument, played by plucking or strumming",
    url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "26",
    name: "Piano",
    answers: ["Piano", "Grand Piano", "Keyboard"],
    category: "Object",
    difficulty: "easy",
    hint: "Large keyboard instrument with black and white keys",
    url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "27",
    name: "Bicycle",
    answers: ["Bicycle", "Bike", "Cycle"],
    category: "Object",
    difficulty: "easy",
    hint: "Two-wheeled vehicle powered by pedals",
    url: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "28",
    name: "Sports Car",
    answers: ["Sports Car", "Car", "Porsche", "Supercar"],
    category: "Object",
    difficulty: "easy",
    hint: "A low, fast passenger vehicle designed for high performance",
    url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "29",
    name: "Laptop",
    answers: ["Laptop", "Computer", "Notebook"],
    category: "Object",
    difficulty: "easy",
    hint: "Portable personal computer with a folding clamshell design",
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&h=600&q=80"
  },
  {
    id: "30",
    name: "Golden Retriever",
    answers: ["Golden Retriever", "Dog", "Puppy", "Golden Retriever Dog"],
    category: "Animal",
    difficulty: "easy",
    hint: "A popular breed of friendly, golden-coated retriever dogs",
    url: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&h=600&q=80"
  }
];

const destDir = path.join(__dirname, '..', 'public', 'images', 'game');
const metadataPath = path.join(__dirname, '..', 'public', 'data', 'images.json');

// Ensure destination dir exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

function downloadImage(urlString, dest) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlString);
      const httpModule = urlObj.protocol === 'https:' ? https : require('http');
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      };
      
      httpModule.get(urlString, options, (response) => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          let redirectUrl = response.headers.location;
          if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
            redirectUrl = new URL(redirectUrl, urlObj.origin).toString();
          }
          downloadImage(redirectUrl, dest).then(resolve).catch(reject);
          return;
        }
        if (response.statusCode === 200) {
          const fileStream = fs.createWriteStream(dest);
          response.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve();
          });
          fileStream.on('error', (err) => {
            fs.unlink(dest, () => {});
            reject(err);
          });
        } else {
          reject(new Error(`Failed to download image: Status ${response.statusCode}`));
        }
      }).on('error', (err) => {
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function run() {
  console.log("Starting image downloads...");
  const metadata = [];

  for (let i = 0; i < imageList.length; i++) {
    const item = imageList[i];
    const filename = `image-${item.id}.webp`;
    const destPath = path.join(destDir, filename);

    console.log(`Downloading [${item.id}/30] ${item.name} from Unsplash...`);
    try {
      await downloadImage(item.url, destPath);
      metadata.push({
        id: item.id,
        filename: filename,
        answers: item.answers,
        category: item.category,
        difficulty: item.difficulty,
        hint: item.hint
      });
    } catch (err) {
      console.error(`Error downloading image ${item.id}:`, err.message);
    }
  }

  // Write JSON metadata
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Successfully downloaded all images and created metadata at: ${metadataPath}`);
}

run();
