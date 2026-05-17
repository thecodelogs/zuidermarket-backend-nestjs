# DROP DATABASE zm;
# CREATE DATABASE zm;
INSERT INTO
    zm.team (id, name)
SELECT
    mt.teamId as id,
    mt.teamNaam AS name
FROM
    zuidermrkt_makkie.mrkt_teams mt
ORDER BY
    mt.teamId;

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'planner'
WHERE
    functieId = '1';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'market-lead'
WHERE
    functieId = '2';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'market-affairs'
WHERE
    functieId = '3';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'treasurer'
WHERE
    functieId = '4';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'business-owner'
WHERE
    functieId = '5';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'member-admin'
WHERE
    functieId = '6';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'team-mentor'
WHERE
    functieId = '7';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'market-lead-assistant'
WHERE
    functieId = '8';

UPDATE
    zuidermrkt_makkie.mrkt_functies
SET
    functie = 'board-member'
WHERE
    functieId = '9';

# USERS
INSERT INTO
    zm.user (
        id,
        email,
        password,
        isActive,
        teamId,
        roles,
        firstName,
        lastName,
        phone,
        phoneSecondary,
        language,
        employmentStatus,
        dateOfBirth,
        gender,
        carryingCapacity,
        prefersOverlappingShift,
        address,
        postcode,
        city,
        memberCardNumber,
        memberCardNumberSecondary,
        emailSecondary,
        disabilities,
        specialties,
        noteByMember,
        noteByMarketLead,
        hasMarketDuty,
        hasPaidEntryFee,
        emailOptout,
        lastNamePrefix
    )
SELECT
    ml.lidId id,
    ml.email,
    UUID() password,
    '1' isActive,
    mtli.teamId teamId,
    IF(
        GROUP_CONCAT(mf.functie) IS NULL,
        'member',
        CONCAT('member,', GROUP_CONCAT(mf.functie))
    ) roles,
    ml.voornaam firstName,
    ml.achternaam lastName,
    ml.telefoon1 phone,
    ml.telefoon2 phoneSecondary,
    'nl',
    CASE
        WHEN ml.lidstatus = 'actief' THEN 'active'
        WHEN ml.lidstatus = 'uitgeschreven' THEN 'terminated'
        WHEN ml.lidstatus = 'overleden' THEN 'deceased'
    END employmentStatus,
    ml.geboortedatum dateOfBirth,
    IF(ml.geslacht = 'm', 'male', 'female') gender,
    'medium' carryingCapacity,
    '0' prefersOverlappingShift,
    CONCAT(
        ml.adres,
        ' ',
        ml.huisnummer,
        ' ',
        ml.achtervoegselnr
    ) address,
    ml.postcode postcode,
    ml.plaats city,
    ml.pasnummer memberCardNumber,
    ml.reservePas memberCardNumberSecondary,
    ml.emailAlt emailSecondary,
    ml.beperkingen disabilities,
    ml.specialiteiten specialties,
    ml.opmerkingenLid noteByMember,
    ml.opmerkingenMeester noteByMarketLead,
    IF(ml.kraamVerplichting = 'ja', '1', '0') hasMarketDuty,
    IF(ml.betalingVoldaan = 'ja', '1', '0') hasPaidEntryFee,
    '0' emailOptout,
    ml.voorvoegsels lastNamePrefix
FROM
    zuidermrkt_makkie.mrkt_leden ml
    LEFT JOIN zuidermrkt_makkie.mrkt_lid_functie_idx mlfi ON ml.lidId = mlfi.lidId
    LEFT JOIN zuidermrkt_makkie.mrkt_functies mf ON mf.functieId = mlfi.functieId
    LEFT JOIN zuidermrkt_makkie.mrkt_team_lid_idx mtli ON ml.lidId = mtli.lidId
    LEFT JOIN zuidermrkt_makkie.mrkt_teams mt ON mtli.teamId = mt.teamId
GROUP BY
    ml.lidId;