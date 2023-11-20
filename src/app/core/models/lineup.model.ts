
export interface Lineup {
    team: Team;
    coach: Coach;
    formation: string;
    startXI: Player[];
    substitutes: Player[];
}

export interface Team {
    id: number;
    name: string;
    logo: string;
    colors: string | null;
}

export interface Coach {
    id: number;
    name: string;
    photo: string;
}

export interface Player {
    player: PlayerDetail;
}

export interface PlayerDetail {
    id: number;
    name: string;
    number: number;
    pos: string;
    grid: string;
}

export class LineupModel implements Lineup {
    team: Team;
    coach: Coach;
    formation: string;
    startXI: Player[];
    substitutes: Player[];

    constructor() {
        this.team = {
            id: 0,
            name: "",
            logo: "",
            colors: null
        };
        this.coach = {
            id: 0,
            name: "",
            photo: ""
        };
        this.formation = "";
        this.startXI = [];
        this.substitutes = [];
    }
}

