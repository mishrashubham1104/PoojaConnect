const defaultPanditImages = [
  "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1582559930337-373860088921?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1621506821199-a996ef1fc41b?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1609139003551-ee40f5f73ec0?auto=format&fit=crop&w=400&q=80"
];

export const getRandomAvatar = () => {
  return defaultPanditImages[Math.floor(Math.random() * defaultPanditImages.length)];
};