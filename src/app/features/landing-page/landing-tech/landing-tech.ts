import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface Technology {
  name: string;
  iconPath: string;
  altText: string;
  colSpanClass?: string;
  bgClass: string;
}

@Component({
  selector: 'app-landing-tech',
  imports: [TranslatePipe],
  templateUrl: './landing-tech.html',
  styleUrl: './landing-tech.scss',
})
export class LandingTechComponent {
  technologies: Technology[] = [
    {
      name: 'Angular 22',
      iconPath: '/assets/images/tech/angular.svg',
      altText: 'Angular logo',
      bgClass: 'bg-red-50'
    },
    {
      name: 'Tailwind CSS',
      iconPath: '/assets/images/tech/tailwindcss.svg',
      altText: 'Tailwind CSS logo',
      bgClass: 'bg-cyan-50'
    },
    {
      name: 'Node.js',
      iconPath: '/assets/images/tech/nodejs.svg',
      altText: 'Node.js logo',
      bgClass: 'bg-green-50'
    },
    {
      name: 'Supabase',
      iconPath: '/assets/images/tech/supabase.svg',
      altText: 'Supabase logo',
      bgClass: 'bg-emerald-50'
    },
    {
      name: 'BullMQ / Redis',
      iconPath: '/assets/images/tech/redis.svg',
      altText: 'Redis logo',
      colSpanClass: 'col-span-2 sm:col-span-1',
      bgClass: 'bg-orange-50'
    }
  ];

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    // Hide the broken image if loading fails
    imgElement.style.display = 'none';
  }
}
