import { PlayerModel } from './player.model';

describe('PlayerModel', () => {
  it('should create an instance', () => {
    // Create a mock Player object
    const mockPlayer = {
      id: 1,
      name: 'John Doe',
      club: 101,
      age: 25,
      number: 10,
      position: 'Forward',
      photo: 'http://example.com/photo.jpg'
    };

    // Instantiate the PlayerModel with the mock Player object
    const playerModel = new PlayerModel(mockPlayer);

    // Assert that the instance was created
    expect(playerModel).toBeTruthy();

    // Optionally, you can add more tests to check if the properties are set correctly
    expect(playerModel.id).toEqual(mockPlayer.id);
    expect(playerModel.name).toEqual(mockPlayer.name);
    expect(playerModel.club).toEqual(mockPlayer.club);
    expect(playerModel.age).toEqual(mockPlayer.age);
    expect(playerModel.number).toEqual(mockPlayer.number);
    expect(playerModel.position).toEqual(mockPlayer.position);
    expect(playerModel.photo).toEqual(mockPlayer.photo);
  });
});
