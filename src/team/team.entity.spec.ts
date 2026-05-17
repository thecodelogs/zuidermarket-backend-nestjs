import { Team } from './team.entity';
import { subYears } from 'date-fns';
import { User } from 'src/user/user.entity';
import { Gender } from 'src/user/enums/gender.enum';

const now = new Date();
const user = new User();
const youngAges = [15, 20, 25, 30, 35, 40];
const oldAges = [50, 60, 70, 80, 90, 100];
const sixYoungMales: User[] = mapAgeToUser(youngAges, Gender.MALE);
const sixOldMales: User[] = mapAgeToUser(oldAges, Gender.MALE);
const sixYoungFemales: User[] = mapAgeToUser(youngAges, Gender.FEMALE);
const sixOldFemales: User[] = mapAgeToUser(oldAges, Gender.FEMALE);

function mapAgeToUser(ages: number[], gender: Gender) {
    return ages.map((age) => {
        const u = new User();
        u.dateOfBirth = subYears(now, age);
        u.gender = gender;
        return u;
    });
}

describe('TeamEntity', () => {
    let team: Team;

    beforeEach(() => {
        team = new Team();
    });

    describe('getPeopleCountScore', () => {
        it('should return 0 if users is undefined or null', () => {
            expect(team.getPeopleCountScore(undefined)).toBe(0);
            expect(team.getPeopleCountScore(null)).toBe(0);
        });

        const six = sixYoungMales;
        const one = six.slice(0, 1);
        const three = six.slice(0, 3);
        const seven = [...six, ...one];
        const nine = [...six, ...three];
        const twelve = [...six, ...six];
        const thirteen = [...twelve, ...one];
        const eighteen = [...six, ...six, ...six];

        it('should return the maximum score of 1 if the member count is 12', () => {
            expect(team.getPeopleCountScore(twelve)).toBe(1);
        });
        it('should return the minimum score of 0 if the member count is lower than or equal to 6 or bigger than or equal to 18', () => {
            expect(team.getPeopleCountScore(eighteen)).toBe(0);
            expect(team.getPeopleCountScore(six)).toBe(0);
        });
        it('should return higher rating the closer the member count is to 12', () => {
            expect(team.getPeopleCountScore(twelve)).toBeGreaterThan(
                team.getPeopleCountScore(nine),
            );
            expect(team.getPeopleCountScore(twelve)).toBeGreaterThan(
                team.getPeopleCountScore(thirteen),
            );
            expect(team.getPeopleCountScore(nine)).toBeGreaterThan(
                team.getPeopleCountScore(seven),
            );
        });
    });

    describe('getGenderScore', () => {
        it('should return 0 if users is undefined or null', () => {
            expect(team.getGenderScore(undefined)).toBe(0);
            expect(team.getGenderScore(null)).toBe(0);
        });

        const [males, females] = [sixYoungMales, sixYoungFemales];
        const perfectEven = [...males, ...females];
        const mostlyFemale = [...females, ...females, ...males];
        const mostlyMale = [...males, ...males, ...females];
        const allMale = males;
        const allFemale = females;
        it('should return the minimum score of 0 to all-male or all-female teams', () => {
            expect(team.getGenderScore(allMale)).toBe(0);
            expect(team.getGenderScore(allFemale)).toBe(0);
        });
        it('should return the maximum score of 1 to a team with a male:female ratio of 1:1', () => {
            expect(team.getGenderScore(perfectEven)).toBe(1);
        });
        it('should return a higher rating the closer the male:female ratio is to 1:1', () => {
            expect(team.getGenderScore(perfectEven)).toBeGreaterThan(
                team.getGenderScore(allFemale),
            );
            expect(team.getGenderScore(perfectEven)).toBeGreaterThan(
                team.getGenderScore(allMale),
            );
            expect(team.getGenderScore(perfectEven)).toBeGreaterThan(
                team.getGenderScore(mostlyFemale),
            );
            expect(team.getGenderScore(perfectEven)).toBeGreaterThan(
                team.getGenderScore(mostlyMale),
            );
            expect(team.getGenderScore(mostlyFemale)).toBeGreaterThan(
                team.getGenderScore(allFemale),
            );
        });
    });

    describe('getAgeScore', () => {
        it('should return 0 if users is undefined or null', () => {
            expect(team.getAgeScore(undefined)).toBe(0);
            expect(team.getAgeScore(null)).toBe(0);
        });

        const [young, old] = [sixYoungMales, sixOldMales];
        const youngAndOld = [...young, ...old];
        const mostlyOld = [...old, ...old, ...young];
        const mostlyYoung = [...young, ...young, ...old];
        const allOld = old;
        const allYoung = young;
        it('should return the maximum score of 1 if the young old ratio is 1:1.', () => {
            expect(team.getAgeScore(youngAndOld)).toBe(1);
        });
        it('should return the minimum score of 0 if the young old ratio is 1:0 or 0:1.', () => {
            expect(team.getAgeScore(allOld)).toBe(0);
            expect(team.getAgeScore(allYoung)).toBe(0);
        });
        it('should return a higher rating bigger the age spread', () => {
            expect(team.getAgeScore(youngAndOld)).toBeGreaterThan(
                team.getAgeScore(mostlyOld),
            );
            expect(team.getAgeScore(youngAndOld)).toBeGreaterThan(
                team.getAgeScore(allOld),
            );
            expect(team.getAgeScore(youngAndOld)).toBeGreaterThan(
                team.getAgeScore(mostlyYoung),
            );
            expect(team.getAgeScore(youngAndOld)).toBeGreaterThan(
                team.getAgeScore(allYoung),
            );
        });
    });
});
