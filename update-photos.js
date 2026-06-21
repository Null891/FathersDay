const fs = require('fs');

const photosJsPath = './src/photos.js';
let content = fs.readFileSync(photosJsPath, 'utf8');

const quotes = [
  "A father's love is a guiding light. 父親的愛是明燈。",
  "Every moment with you is a treasure. 每個與你相伴的時刻都是珍寶。",
  "Footsteps we follow, hands we hold. 追隨你的腳步，握緊你的手。",
  "Smiles that light up our world. 照亮我們世界的笑容。",
  "Adventures big and small with Dad. 和爸爸的大小冒險。",
  "Thank you for being our hero. 謝謝你做我們的英雄。",
  "Building memories, one day at a time. 一磚一瓦，築起回憶。",
  "Quiet strength, loud laughs. 沉靜的力量，爽朗的笑聲。",
  "The anchor of our family. 我們家的避風港。",
  "Always by our side. 總是在我們身邊。",
  "Lessons learned, love shared. 分享愛與智慧。",
  "Our favorite place is together. 我們最愛的地方就是在一起。",
  "Happy Father's Day! 父親節快樂！",
  "Through your eyes, we see the world. 透過你的雙眼，我們看見世界。",
  "Unconditional love. 無條件的愛。",
  "The best dad we could ask for. 最棒的爸爸。",
  "Cheers to the man of the house. 敬我們的一家之主。",
  "Family time is the best time. 家庭時光是最美好的時光。",
  "So much to be grateful for. 充滿無限的感激。",
  "Memories that will last a lifetime. 伴隨一生的回憶。",
  "Your guidance shapes our path. 你的指引塑造了我們的道路。",
  "A lifetime of love and laughter. 一生的愛與歡笑。",
  "The rock of our family. 我們家庭的磐石。",
  "Forever grateful for you. 永遠感激有你。",
  "Dad: Our first teacher, our forever friend. 爸爸：我們第一位老師，永遠的朋友。",
  "Celebrating the heart of our family. 慶祝我們家庭的核心。",
  "Your hugs make everything better. 你的擁抱讓一切變得更好。",
  "To the world, you are a dad. To our family, you are the world. 對世界而言，你是一位父親；對我們而言，你是全世界。"
];

const dates = [
  "Father's Day 2024", "Summer 2023", "Spring 2022", "June 2021", 
  "Autumn 2023", "Winter 2022", "Father's Day 2020", "August 2021",
  "Family Trip 2022", "Father's Day 2023", "May 2024", "December 2023",
  "March 2023", "July 2022", "September 2021", "Father's Day 2019"
];

// Extract keys from CAPTIONS block
const captionsMatch = content.match(/export const CAPTIONS = {([\s\S]*?)}/);
if (captionsMatch) {
  const inner = captionsMatch[1];
  const keys = [...inner.matchAll(/'([^']+)'/g)].map(m => m[1]);
  
  let newCaptions = 'export const CAPTIONS = {\n';
  keys.forEach((key, i) => {
    // Unique keys so we use modulo to pick quotes and dates
    const quote = quotes[i % quotes.length];
    const date = dates[(i * 3) % dates.length];
    // Write as object: { text: "...", date: "..." }
    newCaptions += `  '${key}': { text: "${quote}", date: "${date}" },\n`;
  });
  newCaptions += '}';
  
  content = content.replace(/export const CAPTIONS = {[\s\S]*?}/, newCaptions);
  fs.writeFileSync(photosJsPath, content, 'utf8');
  console.log("Updated photos.js successfully.");
} else {
  console.log("Failed to find CAPTIONS block.");
}
