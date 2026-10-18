/* English word bank for MeAsocie (normal mode). Same shape as words.js, which the game engine reads:
   `nome` = category name, `palavras` = its words (those two field names are kept on purpose,
   so both languages go through exactly the same code).
   Rules for editing: no word repeated anywhere in the bank (case-insensitive), no category name used
   as a word, 12 words per category, and no word segment (split on spaces/hyphens) over 11 letters
   so it fits on a card. tools/validate-banks.js checks all of this. */
(function (root) {
  'use strict';
  var BANK = [
    { nome: 'Fruits', palavras: ['Banana', 'Apple', 'Grape', 'Pear', 'Mango', 'Pineapple', 'Strawberry', 'Watermelon', 'Peach', 'Cherry', 'Kiwi', 'Lemon'] },
    { nome: 'Vegetables', palavras: ['Carrot', 'Potato', 'Tomato', 'Lettuce', 'Broccoli', 'Pumpkin', 'Beet', 'Cucumber', 'Cabbage', 'Spinach', 'Eggplant', 'Celery'] },
    { nome: 'Spices', palavras: ['Salt', 'Pepper', 'Oregano', 'Garlic', 'Cinnamon', 'Cumin', 'Bay leaf', 'Parsley', 'Basil', 'Saffron', 'Ginger', 'Paprika'] },
    { nome: 'Drinks', palavras: ['Water', 'Juice', 'Coffee', 'Milk', 'Beer', 'Wine', 'Tea', 'Lemonade', 'Soda', 'Cider', 'Champagne', 'Smoothie'] },
    { nome: 'Desserts', palavras: ['Pudding', 'Ice cream', 'Cake', 'Brownie', 'Cookie', 'Pie', 'Mousse', 'Cupcake', 'Donut', 'Cheesecake', 'Sundae', 'Fudge'] },
    { nome: 'Fast food', palavras: ['Burger', 'Fries', 'Hot dog', 'Pizza', 'Taco', 'Nachos', 'Nuggets', 'Burrito', 'Wings', 'Kebab', 'Onion rings', 'Wrap'] },
    { nome: 'Breakfast', palavras: ['Bread', 'Butter', 'Cheese', 'Ham', 'Jam', 'Toast', 'Omelet', 'Cereal', 'Yogurt', 'Granola', 'Pancake', 'Bacon'] },
    { nome: 'Meats', palavras: ['Beef', 'Pork', 'Chicken', 'Lamb', 'Turkey', 'Sausage', 'Steak', 'Ribs', 'Veal', 'Duck', 'Salami', 'Meatball'] },
    { nome: 'Farm animals', palavras: ['Cow', 'Pig', 'Sheep', 'Goat', 'Horse', 'Hen', 'Rooster', 'Donkey', 'Bull', 'Mule', 'Goose', 'Rabbit'] },
    { nome: 'Wild animals', palavras: ['Lion', 'Tiger', 'Elephant', 'Giraffe', 'Zebra', 'Monkey', 'Wolf', 'Bear', 'Fox', 'Hippo', 'Rhino', 'Leopard'] },
    { nome: 'Birds', palavras: ['Eagle', 'Parrot', 'Owl', 'Sparrow', 'Pigeon', 'Toucan', 'Swan', 'Penguin', 'Hawk', 'Flamingo', 'Crow', 'Peacock'] },
    { nome: 'Sea animals', palavras: ['Shark', 'Dolphin', 'Whale', 'Octopus', 'Crab', 'Jellyfish', 'Seahorse', 'Starfish', 'Lobster', 'Squid', 'Shrimp', 'Stingray'] },
    { nome: 'Insects', palavras: ['Ant', 'Bee', 'Fly', 'Butterfly', 'Mosquito', 'Beetle', 'Ladybug', 'Cricket', 'Wasp', 'Moth', 'Dragonfly', 'Grasshopper'] },
    { nome: 'Reptiles', palavras: ['Snake', 'Lizard', 'Crocodile', 'Turtle', 'Gecko', 'Iguana', 'Chameleon', 'Alligator', 'Cobra', 'Python', 'Tortoise', 'Viper'] },
    { nome: 'Flowers and plants', palavras: ['Rose', 'Daisy', 'Tulip', 'Sunflower', 'Orchid', 'Lily', 'Cactus', 'Fern', 'Violet', 'Jasmine', 'Lavender', 'Poppy'] },
    { nome: 'Trees', palavras: ['Oak', 'Pine', 'Maple', 'Birch', 'Willow', 'Cedar', 'Palm', 'Elm', 'Cypress', 'Redwood', 'Bamboo', 'Baobab'] },
    { nome: 'Colors', palavras: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Turquoise'] },
    { nome: 'Shapes', palavras: ['Circle', 'Square', 'Triangle', 'Oval', 'Star', 'Heart', 'Diamond', 'Cube', 'Sphere', 'Cone', 'Pentagon', 'Hexagon'] },
    { nome: 'Months', palavras: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'] },
    { nome: 'Feelings', palavras: ['Joy', 'Anger', 'Fear', 'Sadness', 'Love', 'Jealousy', 'Pride', 'Shame', 'Surprise', 'Calm', 'Hope', 'Boredom'] },
    { nome: 'Family', palavras: ['Mother', 'Father', 'Sister', 'Brother', 'Uncle', 'Aunt', 'Cousin', 'Grandma', 'Grandpa', 'Nephew', 'Niece', 'Twin'] },
    { nome: 'Human body', palavras: ['Arm', 'Leg', 'Hand', 'Foot', 'Head', 'Knee', 'Elbow', 'Shoulder', 'Neck', 'Back', 'Stomach', 'Finger'] },
    { nome: 'Face', palavras: ['Eye', 'Nose', 'Mouth', 'Ear', 'Cheek', 'Chin', 'Forehead', 'Eyebrow', 'Eyelash', 'Lips', 'Tooth', 'Tongue'] },
    { nome: 'Jobs', palavras: ['Doctor', 'Teacher', 'Chef', 'Pilot', 'Farmer', 'Nurse', 'Lawyer', 'Painter', 'Firefighter', 'Plumber', 'Baker', 'Engineer'] },
    { nome: 'Clothes', palavras: ['Shirt', 'Pants', 'Dress', 'Skirt', 'Jacket', 'Socks', 'Shoes', 'Coat', 'Sweater', 'Shorts', 'Jeans', 'Pajamas'] },
    { nome: 'Accessories', palavras: ['Hat', 'Scarf', 'Gloves', 'Belt', 'Watch', 'Necklace', 'Bracelet', 'Earrings', 'Sunglasses', 'Ring', 'Tie', 'Purse'] },
    { nome: 'Hygiene', palavras: ['Soap', 'Shampoo', 'Toothbrush', 'Toothpaste', 'Towel', 'Comb', 'Deodorant', 'Razor', 'Floss', 'Tissue', 'Perfume', 'Lotion'] },
    { nome: 'Rooms of the house', palavras: ['Kitchen', 'Bedroom', 'Bathroom', 'Garage', 'Attic', 'Basement', 'Hallway', 'Balcony', 'Pantry', 'Nursery', 'Study', 'Porch'] },
    { nome: 'Furniture', palavras: ['Sofa', 'Table', 'Chair', 'Bed', 'Wardrobe', 'Desk', 'Shelf', 'Dresser', 'Bench', 'Stool', 'Armchair', 'Bookcase'] },
    { nome: 'Kitchenware', palavras: ['Fork', 'Knife', 'Spoon', 'Plate', 'Cup', 'Pot', 'Pan', 'Whisk', 'Ladle', 'Grater', 'Spatula', 'Kettle'] },
    { nome: 'Tools', palavras: ['Hammer', 'Saw', 'Drill', 'Wrench', 'Pliers', 'Screwdriver', 'Chisel', 'Ladder', 'Shovel', 'Axe', 'Level', 'Nails'] },
    { nome: 'School supplies', palavras: ['Pencil', 'Eraser', 'Notebook', 'Ruler', 'Backpack', 'Scissors', 'Glue', 'Marker', 'Crayon', 'Sharpener', 'Stapler', 'Binder'] },
    { nome: 'Technology', palavras: ['Computer', 'Phone', 'Tablet', 'Keyboard', 'Mouse', 'Screen', 'Camera', 'Drone', 'Router', 'Printer', 'Headphones', 'Robot'] },
    { nome: 'Transport', palavras: ['Car', 'Bus', 'Train', 'Bicycle', 'Airplane', 'Boat', 'Subway', 'Truck', 'Motorcycle', 'Helicopter', 'Scooter', 'Taxi'] },
    { nome: 'Places in town', palavras: ['Bank', 'Library', 'Hospital', 'Pharmacy', 'Bakery', 'Market', 'Museum', 'Cinema', 'Park', 'School', 'Church', 'Stadium'] },
    { nome: 'Countries', palavras: ['France', 'Japan', 'Brazil', 'Canada', 'Egypt', 'India', 'Mexico', 'Italy', 'Spain', 'Kenya', 'Norway', 'Chile'] },
    { nome: 'World capitals', palavras: ['Paris', 'Tokyo', 'Lima', 'Cairo', 'Rome', 'Madrid', 'Berlin', 'London', 'Ottawa', 'Oslo', 'Lisbon', 'Brasília'] },
    { nome: 'Nature', palavras: ['River', 'Mountain', 'Forest', 'Desert', 'Island', 'Valley', 'Waterfall', 'Volcano', 'Lake', 'Cave', 'Canyon', 'Glacier'] },
    { nome: 'Weather', palavras: ['Rain', 'Snow', 'Wind', 'Storm', 'Fog', 'Thunder', 'Lightning', 'Hail', 'Rainbow', 'Drizzle', 'Sunshine', 'Tornado'] },
    { nome: 'Space', palavras: ['Planet', 'Moon', 'Sun', 'Comet', 'Galaxy', 'Asteroid', 'Rocket', 'Orbit', 'Meteor', 'Nebula', 'Saturn', 'Astronaut'] },
    { nome: 'Beach', palavras: ['Sand', 'Wave', 'Shell', 'Umbrella', 'Sunscreen', 'Surfboard', 'Lifeguard', 'Seagull', 'Bucket', 'Snorkel', 'Sandcastle', 'Coconut'] },
    { nome: 'Sports', palavras: ['Soccer', 'Tennis', 'Swimming', 'Volleyball', 'Basketball', 'Baseball', 'Golf', 'Boxing', 'Rugby', 'Surfing', 'Cycling', 'Karate'] },
    { nome: 'Instruments', palavras: ['Guitar', 'Piano', 'Drums', 'Violin', 'Flute', 'Trumpet', 'Cello', 'Harp', 'Saxophone', 'Ukulele', 'Clarinet', 'Accordion'] },
    { nome: 'Music styles', palavras: ['Rock', 'Jazz', 'Blues', 'Pop', 'Samba', 'Reggae', 'Country', 'Hip hop', 'Opera', 'Techno', 'Funk', 'Salsa'] },
    { nome: 'Toys', palavras: ['Doll', 'Kite', 'Puzzle', 'Teddy bear', 'Yo-yo', 'Marbles', 'Blocks', 'Rattle', 'Frisbee', 'Jump rope', 'Rubber duck', 'Dominoes'] },
    { nome: 'Folklore', palavras: ['Bigfoot', 'Troll', 'Banshee', 'Werewolf', 'Leprechaun', 'Goblin', 'Kraken', 'Yeti', 'Gnome', 'Zombie', 'Golem', 'Pixie'] },
    { nome: 'Fantasy creatures', palavras: ['Dragon', 'Fairy', 'Witch', 'Mermaid', 'Unicorn', 'Vampire', 'Elf', 'Giant', 'Ghost', 'Wizard', 'Phoenix', 'Centaur'] },
    { nome: 'Holidays', palavras: ['Christmas', 'Easter', 'Halloween', 'Valentine', 'New Year', 'Hanukkah', 'Diwali', 'Carnival', 'Birthday', 'Eid', 'Passover', 'Kwanzaa'] },
    { nome: 'School subjects', palavras: ['Math', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology', 'English', 'Art', 'Philosophy', 'Literature', 'Spanish', 'Economics'] }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = BANK;
  else root.WORD_BANK_EN = BANK;
})(typeof window !== 'undefined' ? window : globalThis);
