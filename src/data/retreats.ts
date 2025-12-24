import retreatBali from '@/assets/retreat-bali.jpg';
import retreatThailand from '@/assets/retreat-thailand.jpg';
import retreatCostarica from '@/assets/retreat-costarica.jpg';
import retreatIndia from '@/assets/retreat-india.jpg';
import { Retreat } from '@/types/retreat';

export const mockRetreats: Retreat[] = [
  {
    id: '1',
    name: '7 Day Wellness Package, Yoga, Meditation and More',
    location: 'Phetchabun',
    country: 'Thailand',
    dates: 'Flexible',
    duration: '7 days',
    price: 631,
    currency: 'USD',
    image: retreatThailand,
    description: 'This retreat offers a mix of yoga, meditation, and wellness activities. It includes a variety of yoga styles, guided meditation, temple visits, and healthy Thai cuisine. You can also enjoy nature walks, Thai cooking classes, and traditional Thai massages.',
    activities: ['Yoga', 'Meditation', 'Temple Visits', 'Thai Cuisine', 'Cooking Classes'],
    category: 'wellness',
    rating: 4.9,
    featured: true,
  },
  {
    id: '2',
    name: '5 Day Surf & Yoga Retreat',
    location: 'Ubud',
    country: 'Bali, Indonesia',
    dates: 'Available Year-round',
    duration: '5 days',
    price: 850,
    currency: 'USD',
    image: retreatBali,
    description: 'Combine the thrill of surfing with the tranquility of yoga in beautiful Bali. Experience daily surf lessons, morning yoga sessions, organic vegan meals, and Balinese cultural experiences.',
    activities: ['Surfing', 'Yoga', 'Vegan Food', 'Cultural Tours', 'Spa Treatments'],
    category: 'surf',
    rating: 4.8,
    featured: true,
  },
  {
    id: '3',
    name: '10 Day Spiritual Healing Retreat',
    location: 'Rishikesh',
    country: 'India',
    dates: 'Monthly Sessions',
    duration: '10 days',
    price: 499,
    currency: 'USD',
    image: retreatIndia,
    description: 'Immerse yourself in the spiritual heart of India. Experience traditional ashram living, daily yoga and meditation, Ayurvedic treatments, and sacred ceremonies along the Ganges River.',
    activities: ['Yoga', 'Meditation', 'Ayurveda', 'Sacred Ceremonies', 'Himalayan Treks'],
    category: 'spiritual',
    rating: 4.7,
  },
  {
    id: '4',
    name: '6 Day Ocean View Yoga & Wellness',
    location: 'Guanacaste',
    country: 'Costa Rica',
    dates: 'Available Year-round',
    duration: '6 days',
    price: 1200,
    currency: 'USD',
    image: retreatCostarica,
    description: 'Rejuvenate in the tropical paradise of Costa Rica. Enjoy oceanfront yoga sessions, rainforest hiking, wildlife encounters, spa treatments, and farm-to-table organic cuisine.',
    activities: ['Yoga', 'Hiking', 'Wildlife', 'Spa', 'Organic Cuisine'],
    category: 'wellness',
    rating: 4.9,
    featured: true,
  },
];

export function searchRetreats(query: string): Retreat[] {
  const lowerQuery = query.toLowerCase();
  
  return mockRetreats.filter(retreat => {
    const searchableText = `
      ${retreat.name} 
      ${retreat.location} 
      ${retreat.country} 
      ${retreat.description} 
      ${retreat.activities.join(' ')} 
      ${retreat.category}
    `.toLowerCase();
    
    // Check for keyword matches
    const keywords = lowerQuery.split(' ').filter(k => k.length > 2);
    return keywords.some(keyword => searchableText.includes(keyword));
  });
}
