import { Component } from '@angular/core';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.css']
})
export class CommonComponent {
  public userName: string = 'Username';
  infoString: string[]= ['Friends', 'Leagues', 'About'];
  postString: string[]= ['Posts', 'Likes', 'Mentions'];
  friendsList: string[]= ['Username 1', 'Username 2', 'Username 3', 'Username 4', 'Username 5', 'Username 6', 'Username 7', 'Username 8', 'Username 9', 'Username 10' ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username'  ,'Username' ];
  leagueList: string[]= ['League 1','League 2','League 3','League 4','League 5','League 6','League 7','League 8','League 9'];
  imageList: string[]= ['KV-Kortrijk-wallpaper.jpg','unnamed.jpg','v2_large_8717893f85b4c67b835c8b9984d0115fbdb37ecf.jpg','vieren-KV-Kortrijk-21-10-2023.jpg'];
  friendActions: string[] = ['3683211.png','add-friend-24.png'];
  selectedLink: string = 'link1';

  changeContent(link: string): void {
    this.selectedLink = link;
  }

  openModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.add('active');
      console.log(this.friendsList);
    }
  }

  closeModal(): void {
    const modal = document.getElementById('friendListModal');
    if (modal) {
      modal.classList.remove('active');
    }
  }
}
