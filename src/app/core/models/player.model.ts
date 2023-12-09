export interface Player {
    id: number;        // Assuming 'id' is an auto-incremented primary key
    name: string;      // Player's name
    club: number;      // Club's ID, which is a foreign key reference to a club table
    age: number;       // Player's age
    number: number;    // Player's jersey number
    position: string;  // Player's position on the field
    photo: string;     // URL to the player's photo
  }

  export class PlayerModel implements Player {
    id: number;
    name: string;
    club: number;
    age: number;
    number: number;
    position: string;
    photo: string;

    constructor(player: Player) {
      this.id = player.id;
      this.name = player.name;
      this.club = player.club;
      this.age = player.age;
      this.number = player.number;
      this.position = player.position;
      this.photo = player.photo;
    }
  }