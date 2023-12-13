import { Component } from '@angular/core';

@Component({
  selector: 'app-faqpage-component',
  templateUrl: './faqpage-component.component.html',
  styleUrls: ['./faqpage-component.component.css']
})
export class FAQPageComponentComponent {
  faqs = [
    {
      question: '1. Can I place bets on football matches through Remontada?',
      answer: 'Yes, you can place bets on football matches. Choose a match from the matches tab, and follow the instructions to place a bet. Please note that betting laws vary by location, and you must comply with local regulations.'
    },
    {
      question: '2. How do I create a football league on Remontada?',
      answer: 'Go to the "League" section and click "Create Friends League." You can set up a private league with friends or a public one (coming soon) open to all Remontada users.'
    },
    {
      question: '3. Is there a mobile app for Remontada?',
      answer: 'No, however, Remontada is fully compatible with all the latest devices, providing a seamless experience across all your devices.'
    },
    {
      question:'4. Can I place bets on football matches through Remontada?',
      answer: 'Yes, you can place bets on football matches. Go to the \'Matches\' section, choose a match, and follow the instructions to place a bet. Please note that betting laws vary by location, and you must comply with local regulations.'
    },
    {
      question:'5. Can I interact with other football fans on Remontada?',
      answer: 'Yes, Remontada offers community features. You can join discussions, share opinions, and connect with other football fans worldwide.'
    },
    {
      question:'6. Is there a customer support service for Remontada users?',
      answer: 'Yes, if you have any issues or inquiries, our customer support team is available 24/7. Contact us through the \'Help\' section.'
    },
    {
      question:'7. I would like to provide you some feedback, what should I do?',
      answer: 'Fill in the following form and we will get back to you as soon as possible: https://forms.office.com/e/c219HYW6dh'
    },



    // ... more FAQs
  ];
}
