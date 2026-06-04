UPDATE "Evenement" SET statut = 'OPTION' WHERE statut::text IN ('PROSPECTION','EN_COURS','REALISE');
UPDATE "Utilisateur" SET role = 'CHEF_PROJET' WHERE role::text IN ('DIRECTEUR','COMMERCIAL','COMPTABLE');
