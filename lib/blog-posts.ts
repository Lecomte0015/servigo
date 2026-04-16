export interface BlogSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: "conseils" | "metiers" | "tarifs" | "securite";
  categoryLabel: string;
  readTime: number;
  keywords: string[];
  intro: string;
  sections: BlogSection[];
  conclusion: string;
  relatedSlugs: string[];
  ctaText: string;
  ctaHref: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "urgence-plomberie-suisse-romande",
    title: "Urgence plomberie en Suisse romande : que faire en cas de fuite ?",
    description:
      "Fuite d'eau, tuyau éclaté, dégât des eaux… Découvrez les bons réflexes à adopter en cas d'urgence plomberie à Genève, Lausanne ou en Suisse romande.",
    publishedAt: "2025-01-15",
    category: "conseils",
    categoryLabel: "Conseils",
    readTime: 6,
    keywords: [
      "plombier urgence genève",
      "plombier urgence lausanne",
      "urgence plomberie suisse romande",
      "fuite eau urgence",
      "dégât des eaux suisse",
    ],
    intro:
      "Une fuite d'eau peut survenir à tout moment — la nuit, un week-end, en pleine période de fêtes. En Suisse romande, où les logements sont souvent anciens et les installations parfois vieillissantes, les urgences de plomberie sont fréquentes. La réaction dans les premières minutes est déterminante pour limiter les dégâts et les coûts.",
    sections: [
      {
        h2: "Les premiers gestes à faire immédiatement",
        paragraphs: [
          "Dès que vous constatez une fuite, votre premier réflexe doit être de couper l'arrivée d'eau. Le robinet d'arrêt général se trouve généralement sous l'évier de cuisine, dans la cave ou dans un placard technique. En coupant l'eau rapidement, vous évitez des dégâts structurels qui peuvent coûter plusieurs milliers de francs.",
          "Si la fuite est proche d'une installation électrique (tableau, prises au sol, câblage apparent), coupez également le disjoncteur correspondant à la zone touchée. Ne touchez jamais à une installation électrique sous tension en présence d'eau.",
        ],
        list: [
          "Couper le robinet d'arrêt général immédiatement",
          "Éponger et protéger les biens (meubles, appareils électriques)",
          "Photographier les dégâts avant nettoyage (pour l'assurance)",
          "Prévenir votre régie ou propriétaire si vous êtes locataire",
          "Contacter un plombier d'urgence disponible 24h/24",
        ],
      },
      {
        h2: "Quand appeler un plombier d'urgence ?",
        paragraphs: [
          "Toutes les fuites ne nécessitent pas un appel d'urgence. Un filet d'eau sous un siphon peut attendre le lendemain matin. En revanche, certaines situations exigent une intervention dans l'heure : tuyau principal éclaté, fuite derrière un mur avec infiltration visible, chauffe-eau qui déborde ou canalisation bouchée avec risque de débordement.",
          "À Genève et Lausanne, de nombreux plombiers proposent des interventions 24h/24, 7j/7. Attention toutefois aux arnaques : certains prestataires pratiquent des tarifs abusifs la nuit. Privilégiez un plombier dont les tarifs sont transparents et vérifiés.",
        ],
      },
      {
        h2: "Comment éviter les arnaques du plombier d'urgence ?",
        paragraphs: [
          "En Suisse romande comme ailleurs, les urgences nocturnes sont malheureusement un terrain fertile pour les prestataires malhonnêtes. Voici comment vous protéger : demandez toujours un devis écrit avant le début des travaux, vérifiez que le professionnel est assuré RC Pro, et méfiez-vous des annonces sans adresse physique ni numéro d'entreprise (IDE).",
          "Les plateformes comme GoServi vérifient les artisans avant de les référencer : assurance RC Pro, formation, avis clients vérifiés. Vous pouvez ainsi faire appel à un plombier d'urgence en toute confiance, même en pleine nuit.",
        ],
      },
      {
        h2: "Quel est le coût d'un plombier d'urgence en Suisse romande ?",
        paragraphs: [
          "Les tarifs varient selon l'heure et la complexité de l'intervention. En journée normale, comptez entre CHF 80 et CHF 120 de l'heure pour un plombier qualifié. Le soir, le week-end ou les jours fériés, une majoration de 30 à 50 % est courante. Une intervention de nuit pour déboucher une canalisation coûte en moyenne CHF 250 à CHF 400.",
          "Ces tarifs incluent généralement le déplacement et la première heure de main-d'œuvre. Les pièces (joints, robinets, tuyaux) sont facturées en supplément. Demandez toujours à ce que le devis distingue la main-d'œuvre des fournitures.",
        ],
      },
      {
        h2: "Prévenir plutôt que guérir : l'entretien annuel",
        paragraphs: [
          "La meilleure urgence est celle qui n'arrive pas. Un contrôle annuel de votre installation de plomberie permet de détecter les joints usés, les calcifications dans les tuyaux et les premières traces de corrosion. En Suisse romande, l'eau du robinet est relativement calcaire dans certaines régions (Vaud, Valais), ce qui accélère l'usure des équipements.",
          "Prévoyez également de faire purger votre chauffe-eau tous les 3 à 5 ans et de remplacer les joints de robinets dès les premières fuites goutte-à-goutte.",
        ],
      },
    ],
    conclusion:
      "En cas d'urgence plomberie en Suisse romande, agissez vite mais méthodiquement : coupez l'eau, sécurisez l'électricité, documentez les dégâts et faites appel à un professionnel vérifié. GoServi met en relation avec des plombiers disponibles 24h/24 à Genève, Lausanne, Fribourg et dans toute la Romandie.",
    relatedSlugs: [
      "prix-artisan-suisse-romande",
      "choisir-artisan-qualifie-suisse",
      "serrurier-urgence-suisse-romande",
    ],
    ctaText: "Trouver un plombier d'urgence maintenant",
    ctaHref: "/auth/register",
  },
  {
    slug: "prix-artisan-suisse-romande",
    title: "Prix d'un artisan en Suisse romande en 2025 : grille tarifaire complète",
    description:
      "Combien coûte un plombier, un électricien ou un serrurier en Suisse romande ? Découvrez les tarifs moyens par métier et par ville pour 2025.",
    publishedAt: "2025-01-20",
    category: "tarifs",
    categoryLabel: "Tarifs",
    readTime: 7,
    keywords: [
      "prix plombier suisse romande",
      "tarif électricien genève lausanne",
      "coût artisan suisse",
      "prix serrurier suisse romande",
      "tarif chauffagiste suisse",
    ],
    intro:
      "Faire appel à un artisan en Suisse romande représente un investissement. Avant de lancer des travaux, il est essentiel de connaître les fourchettes tarifaires pratiquées dans votre canton. Cette grille tarifaire pour 2025 vous aide à budgéter vos interventions et à détecter les devis anormalement élevés.",
    sections: [
      {
        h2: "Tarifs horaires moyens par métier (2025)",
        paragraphs: [
          "En Suisse romande, les tarifs horaires des artisans varient selon la spécialité, la complexité de l'intervention et la région. Voici les fourchettes moyennes pratiquées en 2025 (hors TVA, hors déplacement) :",
        ],
        list: [
          "Plombier : CHF 80–130 / heure (urgence nuit : +40%)",
          "Électricien : CHF 90–140 / heure (certifié ESTI)",
          "Serrurier : CHF 100–180 / heure (ouverture porte : forfait CHF 150–300)",
          "Chauffagiste : CHF 90–130 / heure (révision chaudière : CHF 200–350)",
          "Couvreur : CHF 70–110 / heure + matériaux",
          "Menuisier : CHF 80–120 / heure",
          "Peintre : CHF 60–90 / heure (+ fournitures)",
          "Nettoyage professionnel : CHF 45–75 / heure",
        ],
      },
      {
        h2: "Variations selon les villes de Romandie",
        paragraphs: [
          "Les tarifs à Genève sont généralement 10 à 20 % plus élevés que dans le reste de la Romandie, en raison du coût de la vie plus élevé et des charges sociales cantonales. À Lausanne et Fribourg, les prix sont proches de la moyenne romande. Dans les cantons de Valais et Neuchâtel, les tarifs sont souvent légèrement inférieurs.",
          "Les frais de déplacement sont souvent facturés séparément : comptez CHF 20 à CHF 50 par intervention en zone urbaine. Certains artisans incluent les 30 premières minutes dans un forfait de déplacement.",
        ],
      },
      {
        h2: "Comment obtenir un devis juste ?",
        paragraphs: [
          "Pour éviter les mauvaises surprises, demandez systématiquement un devis écrit détaillé avant chaque intervention. Un bon devis doit mentionner : le taux horaire, le temps estimé, les fournitures (pièces), les frais de déplacement et la TVA (8,1 % en Suisse).",
          "Comparez toujours au moins deux devis pour les travaux dépassant CHF 500. Pour les urgences, la comparaison est difficile — c'est pourquoi utiliser une plateforme avec tarifs vérifiés comme GoServi est particulièrement avantageux.",
        ],
      },
      {
        h2: "Quelles aides et subventions pour vos travaux ?",
        paragraphs: [
          "En Suisse romande, plusieurs programmes cantonaux soutiennent les travaux d'amélioration énergétique. Le Programme Bâtiments (Programme cantonal de l'énergie) subventionne le remplacement de chaudières à mazout, l'isolation thermique et les installations solaires. Renseignez-vous auprès de votre office cantonal de l'énergie.",
          "À Genève, le programme SécoHelp peut prendre en charge une partie des coûts d'urgence pour les ménages en difficulté. À Vaud, le Service de l'énergie propose des subventions pour la rénovation énergétique.",
        ],
      },
      {
        h2: "Les pièges à éviter sur les devis",
        paragraphs: [
          "Méfiez-vous des artisans qui refusent de donner un devis écrit ou qui pratiquent des \"prix du marché\" sans préciser le taux horaire. Les majorations nocturnes et de week-end sont légitimes, mais doivent être annoncées à l'avance. Un artisan sérieux ne vous demandera jamais un acompte de plus de 30 % avant le début des travaux.",
        ],
        list: [
          "Refus de devis écrit : signal d'alarme",
          "Acompte supérieur à 30% exigé avant travaux",
          "Pas d'assurance RC Pro mentionnée",
          "Pas de numéro IDE (registre du commerce suisse)",
          "Pression pour décider immédiatement",
        ],
      },
    ],
    conclusion:
      "Connaître les tarifs pratiqués en Suisse romande vous protège contre les arnaques et vous aide à budgéter sereinement vos travaux. GoServi vous met en contact avec des artisans vérifiés aux tarifs transparents, dans toute la Romandie.",
    relatedSlugs: [
      "urgence-plomberie-suisse-romande",
      "choisir-artisan-qualifie-suisse",
      "electricien-agree-suisse-romande",
    ],
    ctaText: "Demander un devis gratuit",
    ctaHref: "/auth/register",
  },
  {
    slug: "choisir-artisan-qualifie-suisse",
    title: "Comment choisir un artisan de confiance en Suisse romande ?",
    description:
      "Vérifications indispensables, certifications, avis clients… Voici comment identifier un artisan sérieux et qualifié en Suisse romande pour vos travaux.",
    publishedAt: "2025-02-03",
    category: "conseils",
    categoryLabel: "Conseils",
    readTime: 8,
    keywords: [
      "choisir artisan suisse romande",
      "vérifier artisan qualifié",
      "artisan certifié suisse",
      "trouver bon artisan genève lausanne",
      "arnaque artisan suisse",
    ],
    intro:
      "Confier vos travaux à un artisan, c'est accorder votre confiance à un professionnel qui interviendra dans votre logement. En Suisse romande, la qualité des artisans est globalement élevée — mais les mauvaises expériences existent. Voici un guide complet pour sélectionner un professionnel fiable, compétent et transparent.",
    sections: [
      {
        h2: "Les certifications et formations à vérifier",
        paragraphs: [
          "En Suisse, les métiers artisanaux sont encadrés par des formations reconnues. Un plombier qualifié est titulaire d'un CFC (Certificat Fédéral de Capacité) en installations sanitaires. Un électricien doit être agréé ESTI (Inspection Fédérale des Installations à Courant Fort) pour intervenir légalement. Un chauffagiste compétent dispose d'un CFC en technique du bâtiment.",
          "Ces certifications garantissent que l'artisan a suivi une formation rigoureuse, connaît les normes suisses et peut être tenu responsable en cas de malfaçon. Demandez toujours à voir les diplômes ou justificatifs si vous avez un doute.",
        ],
        list: [
          "Plombier : CFC installations sanitaires ou équivalent",
          "Électricien : agrément ESTI obligatoire",
          "Chauffagiste : CFC technique du bâtiment",
          "Couvreur : CFC couverture ou formation reconnue",
          "Menuisier : CFC menuiserie (ébéniste ou charpentier)",
        ],
      },
      {
        h2: "L'assurance responsabilité civile professionnelle (RC Pro)",
        paragraphs: [
          "C'est le critère numéro un. Un artisan sérieux est obligatoirement couvert par une assurance RC Pro. Cette assurance couvre les dommages causés à votre logement ou à des tiers lors de l'intervention : une canalisation percée par erreur, un incendie accidentel, une chute d'objet qui endommage un meuble.",
          "Demandez systématiquement le certificat d'assurance RC Pro avant le début des travaux. Un artisan qui ne peut pas produire ce document prend des risques — et vous en fait prendre aussi.",
        ],
      },
      {
        h2: "Comment lire et vérifier les avis clients",
        paragraphs: [
          "Les avis Google, les témoignages sur les plateformes spécialisées et les recommandations de voisins restent les meilleurs indicateurs de qualité. Méfiez-vous des profils avec uniquement des avis 5 étoiles et aucune critique — c'est souvent signe de faux avis. Un bon artisan aura des avis variés, avec des réponses constructives aux critiques.",
          "Privilégiez les plateformes qui vérifient l'authenticité des avis (seuls les clients ayant réellement utilisé le service peuvent noter). Sur GoServi, les avis sont déposés uniquement après la clôture d'une mission réalisée via la plateforme.",
        ],
      },
      {
        h2: "Le devis : ce qu'il doit absolument contenir",
        paragraphs: [
          "Un devis professionnel en Suisse doit mentionner : le nom et l'adresse de l'entreprise, son numéro IDE (registre du commerce), la date, la description détaillée des travaux, le taux horaire ou le forfait, le détail des fournitures, les délais d'exécution et les conditions de paiement.",
          "Si un artisan vous présente un devis à la main, sans en-tête d'entreprise, ou vous donne un \"prix verbal\" sans rien écrire, c'est un signal d'alarme. En cas de litige, seul un devis écrit signé est opposable.",
        ],
      },
      {
        h2: "Les plateformes vérifiées : une protection supplémentaire",
        paragraphs: [
          "En passant par une plateforme comme GoServi, vous bénéficiez d'un niveau de vérification supplémentaire : chaque artisan référencé a été contrôlé (assurance RC Pro, formation, identité). Vous avez accès à ses avis certifiés et à un historique de missions réalisées.",
          "En cas de problème, la plateforme joue le rôle de tiers de confiance. C'est une garantie supplémentaire que vous n'obtenez pas en appelant un artisan trouvé dans les pages jaunes.",
        ],
      },
    ],
    conclusion:
      "Choisir un bon artisan en Suisse romande demande un minimum de préparation : vérifiez les certifications, l'assurance RC Pro et les avis clients. GoServi simplifie ce processus en ne référençant que des professionnels vérifiés, prêts à intervenir partout en Romandie.",
    relatedSlugs: [
      "prix-artisan-suisse-romande",
      "urgence-plomberie-suisse-romande",
      "electricien-agree-suisse-romande",
    ],
    ctaText: "Trouver un artisan vérifié",
    ctaHref: "/artisans",
  },
  {
    slug: "electricien-agree-suisse-romande",
    title: "Électricien agréé en Suisse romande : pourquoi c'est indispensable",
    description:
      "Installer une prise, rénover un tableau électrique, poser une borne de recharge… En Suisse, ces travaux nécessitent un électricien agréé ESTI. Voici pourquoi.",
    publishedAt: "2025-02-18",
    category: "metiers",
    categoryLabel: "Métiers",
    readTime: 6,
    keywords: [
      "électricien agréé suisse",
      "électricien ESTI suisse romande",
      "travaux électriques suisse",
      "électricien certifié genève lausanne",
      "installation électrique suisse norme",
    ],
    intro:
      "En Suisse, les travaux électriques sont strictement réglementés par l'ESTI (Inspection Fédérale des Installations à Courant Fort). Contrairement à la France ou à l'Allemagne, il est interdit de réaliser la plupart des travaux électriques soi-même, même pour des interventions simples. Voici ce que vous devez savoir avant de faire appel à un électricien en Suisse romande.",
    sections: [
      {
        h2: "Qu'est-ce que l'agrément ESTI ?",
        paragraphs: [
          "L'ESTI est l'autorité fédérale suisse qui contrôle la sécurité des installations électriques. Tout électricien qui réalise des travaux en Suisse doit disposer d'un agrément ESTI valide. Cet agrément certifie que le professionnel connaît et applique les normes NIN (Normes des installations à basse tension) et est autorisé à raccorder des installations au réseau électrique.",
          "Un électricien sans agrément ESTI ne peut légalement pas réaliser des travaux de connexion au réseau, modifier un tableau électrique ou installer des prises. En cas d'accident ou d'incendie suite à une installation non conforme, votre assurance peut refuser de couvrir les dommages.",
        ],
      },
      {
        h2: "Quels travaux nécessitent un électricien agréé ?",
        paragraphs: [
          "La quasi-totalité des travaux électriques permanents en Suisse doit être réalisée par un électricien agréé. Cela inclut : l'installation ou la modification d'un tableau électrique, la pose de nouvelles prises ou interrupteurs raccordés au réseau, l'installation d'un chauffe-eau électrique, la mise en place d'une borne de recharge pour véhicule électrique, et tout câblage encastré.",
          "Seuls quelques travaux très limités peuvent être réalisés sans agrément : remplacer une ampoule ou un luminaire sur une installation existante, changer un interrupteur ou une prise sur un circuit déjà câblé (sous conditions).",
        ],
        list: [
          "Tableau électrique, disjoncteurs, différentiels",
          "Borne de recharge véhicule électrique",
          "Chauffe-eau électrique ou pompe à chaleur",
          "Prises, interrupteurs, câblage encastré",
          "Installation photovoltaïque",
          "Réseau informatique et domotique",
        ],
      },
      {
        h2: "Les risques d'une installation non conforme",
        paragraphs: [
          "Une installation électrique mal réalisée est la première cause d'incendie domestique en Suisse. Les conséquences peuvent être catastrophiques : dommages matériels importants, mise en danger des occupants, et refus de couverture par votre assurance habitation.",
          "En cas de vente d'un bien immobilier, un rapport ESTI est obligatoire. Si des non-conformités sont détectées, les coûts de mise aux normes sont à la charge du propriétaire. Mieux vaut donc investir dans un électricien qualifié dès le départ.",
        ],
      },
      {
        h2: "Borne de recharge et photovoltaïque : les nouvelles demandes",
        paragraphs: [
          "L'essor des véhicules électriques et des panneaux solaires crée une forte demande pour les électriciens en Suisse romande. L'installation d'une borne de recharge domestique (wallbox) nécessite obligatoirement un électricien agréé, qui dimensionnera l'installation en fonction de la puissance disponible dans votre logement.",
          "À Genève, Lausanne et Fribourg, les délais pour ce type d'intervention peuvent être de plusieurs semaines en période de forte demande. GoServi vous permet de contacter directement des électriciens disponibles dans votre ville.",
        ],
      },
    ],
    conclusion:
      "En Suisse romande, les travaux électriques ne doivent être confiés qu'à un électricien agréé ESTI. C'est une obligation légale, mais aussi une protection pour vous, votre famille et votre assurance. GoServi vous met en contact avec des électriciens certifiés disponibles à Genève, Lausanne, Fribourg et dans toute la Romandie.",
    relatedSlugs: [
      "choisir-artisan-qualifie-suisse",
      "prix-artisan-suisse-romande",
      "serrurier-urgence-suisse-romande",
    ],
    ctaText: "Contacter un électricien agréé",
    ctaHref: "/trouver-artisan",
  },
  {
    slug: "serrurier-urgence-suisse-romande",
    title: "Serrurier d'urgence en Suisse romande : guide pratique",
    description:
      "Porte claquée, serrure bloquée, cambriolage… Comment trouver un serrurier d'urgence fiable à Genève, Lausanne ou en Suisse romande sans se faire arnaquer ?",
    publishedAt: "2025-03-05",
    category: "conseils",
    categoryLabel: "Conseils",
    readTime: 5,
    keywords: [
      "serrurier urgence genève",
      "serrurier lausanne urgence",
      "ouverture porte suisse romande",
      "serrurier pas cher suisse",
      "porte claquée genève",
    ],
    intro:
      "Vous voilà devant votre porte, clés enfermées à l'intérieur. Ou pire, vous rentrez chez vous après un cambriolage et devez sécuriser votre logement dans l'heure. En Suisse romande, les situations d'urgence en serrurerie sont courantes — et le marché des «serruriers d'urgence» est malheureusement l'un des plus exposés aux arnaques. Ce guide vous aide à vous en sortir.",
    sections: [
      {
        h2: "Porte claquée : les options avant d'appeler un serrurier",
        paragraphs: [
          "Avant de paniquer et d'appeler le premier numéro trouvé sur Google, vérifiez d'abord si une fenêtre est ouverte en rez-de-chaussée, si votre régie dispose d'un service d'urgence, ou si un voisin ou un membre de votre famille possède un double de vos clés. Dans les immeubles récents à Genève et Lausanne, le concierge ou le service de régie a souvent un double.",
          "Si ces options sont épuisées, il faut faire appel à un serrurier. Prenez le temps — même 5 minutes — de vérifier les avis en ligne avant de choisir.",
        ],
      },
      {
        h2: "Comment reconnaître un serrurier sérieux ?",
        paragraphs: [
          "Un serrurier honnête annonce ses tarifs au téléphone avant de se déplacer. Il donne un prix incluant le déplacement, l'ouverture et un éventuel remplacement de serrure si nécessaire. Il présente une facture détaillée et accepte les moyens de paiement habituels (carte, virement).",
          "Les signaux d'alarme : prix \"selon intervention\" sans estimation, insistance pour remplacer la serrure systématiquement, paiement cash uniquement, pas de facture proposée, numéro de téléphone sans indicatif local.",
        ],
        list: [
          "✅ Tarif annoncé avant déplacement",
          "✅ Adresse physique de l'entreprise vérifiable",
          "✅ Numéro IDE (registre du commerce suisse)",
          "✅ Assurance RC Pro",
          "❌ Prix «au résultat» sans estimation",
          "❌ Paiement cash exclusivement",
          "❌ Remplacement de serrure imposé sans explication",
        ],
      },
      {
        h2: "Tarifs d'un serrurier d'urgence en Suisse romande",
        paragraphs: [
          "Pour une ouverture de porte standard (sans dommage à la serrure) en journée, comptez entre CHF 150 et CHF 250 à Genève et Lausanne. La nuit (après 22h) ou le week-end, les tarifs montent à CHF 300–450. Un remplacement de serrure Vachette ou KESO coûte entre CHF 200 et CHF 600 pièces et pose inclus.",
          "Méfiez-vous des annonces affichant des prix d'appel très bas (\"dès CHF 49\") : ils se rattrapent systématiquement avec des suppléments pour le déplacement, l'outillage ou le «diagnostic».",
        ],
      },
      {
        h2: "Après un cambriolage : les bons réflexes",
        paragraphs: [
          "Si vous avez été victime d'un cambriolage, contactez d'abord la police pour établir un constat avant de toucher quoi que ce soit. Ce rapport est indispensable pour votre assurance. Ensuite, faites appel à un serrurier pour sécuriser la porte dans les plus brefs délais.",
          "Il est vivement conseillé d'améliorer la sécurité de votre logement après un cambriolage : renforcement du dormant, remplacement par une serrure à 5 points, installation d'une poignée sécurisée. Un bon serrurier vous conseillera sur les solutions adaptées à votre porte et à votre budget.",
        ],
      },
    ],
    conclusion:
      "En cas d'urgence serrurerie en Suisse romande, prenez le temps de vérifier le professionnel avant de le laisser intervenir. Sur GoServi, tous les serruriers référencés sont vérifiés, assurés et évalués par de vrais clients. Intervention disponible 24h/24 à Genève, Lausanne et dans toute la Romandie.",
    relatedSlugs: [
      "urgence-plomberie-suisse-romande",
      "choisir-artisan-qualifie-suisse",
      "prix-artisan-suisse-romande",
    ],
    ctaText: "Trouver un serrurier de confiance",
    ctaHref: "/auth/register",
  },
  {
    slug: "entretien-chauffage-suisse-romande",
    title: "Entretien chaudière et chauffage en Suisse romande : tout ce qu'il faut savoir",
    description:
      "Révision annuelle, remplacement, pompe à chaleur… Comment entretenir correctement votre installation de chauffage en Suisse romande et faire les bons choix.",
    publishedAt: "2025-03-20",
    category: "metiers",
    categoryLabel: "Métiers",
    readTime: 7,
    keywords: [
      "entretien chaudière suisse romande",
      "chauffagiste genève lausanne",
      "révision chaudière suisse",
      "pompe à chaleur suisse romande",
      "chauffage panne urgence suisse",
    ],
    intro:
      "En Suisse romande, le chauffage représente en moyenne 70 % de la consommation d'énergie d'un logement. Un entretien régulier de votre installation permet non seulement d'éviter les pannes — souvent au pire moment, en plein hiver — mais aussi de réduire votre facture énergétique de 10 à 15 %. Voici ce que vous devez savoir sur l'entretien du chauffage en Romandie.",
    sections: [
      {
        h2: "La révision annuelle : obligatoire ou recommandée ?",
        paragraphs: [
          "En Suisse, la révision annuelle des chaudières à gaz et à mazout est généralement obligatoire selon les réglementations cantonales. Dans les cantons de Genève, Vaud et Fribourg, des inspections périodiques sont exigées pour vérifier les émissions, l'efficacité et la sécurité des installations.",
          "Une révision typique comprend : le nettoyage du brûleur et du corps de chauffe, le contrôle des émissions (CO, CO₂), la vérification du vase d'expansion et des sécurités, et le réglage de la combustion pour optimiser le rendement. Comptez entre CHF 200 et CHF 350 pour cette prestation annuelle.",
        ],
      },
      {
        h2: "Les signes d'une chaudière défaillante",
        paragraphs: [
          "N'attendez pas la panne totale pour appeler un chauffagiste. Certains signes indiquent qu'une intervention est nécessaire : bruits inhabituels (claquements, sifflements), pression qui chute régulièrement dans le circuit, eau tiède au lieu d'eau chaude, flamme de couleur jaune ou orange (au lieu du bleu), augmentation inexpliquée de la consommation.",
          "Une fuite de monoxyde de carbone (CO) est le danger le plus grave. Ce gaz inodore peut être mortel. Si votre détecteur CO se déclenche, évacuez immédiatement le logement et appelez les secours (117 ou 144) avant tout chauffagiste.",
        ],
        list: [
          "Bruits inhabituels de la chaudière",
          "Pression du circuit qui baisse régulièrement",
          "Eau chaude insuffisante",
          "Voyant de défaut allumé",
          "Consommation de gaz ou mazout anormalement élevée",
          "Déclenchement du détecteur CO (urgence absolue !)",
        ],
      },
      {
        h2: "Pompe à chaleur : la transition énergétique en Suisse romande",
        paragraphs: [
          "De plus en plus de propriétaires en Suisse romande remplacent leur chaudière à mazout ou à gaz par une pompe à chaleur (PAC). En 2025, les subventions cantonales (Programme Bâtiments) couvrent jusqu'à 30 % du coût d'installation d'une PAC air/eau.",
          "Un chauffagiste qualifié peut vous aider à déterminer si votre logement est adapté à une pompe à chaleur, calculer le retour sur investissement et gérer les démarches de subvention. L'installation d'une PAC coûte entre CHF 15 000 et CHF 30 000 selon la puissance et le type (air/eau, eau/eau, géothermique).",
        ],
      },
      {
        h2: "Comment trouver un bon chauffagiste en Suisse romande ?",
        paragraphs: [
          "Un chauffagiste sérieux est titulaire d'un CFC en technique du bâtiment et, pour les installations à gaz, d'une concession cantonale de gazier. Vérifiez qu'il est membre de suissetec (Association suisse et liechtensteinoise de la technique du bâtiment), l'organisation faîtière du secteur.",
          "Sur GoServi, les chauffagistes référencés ont tous été vérifiés pour leurs qualifications et leur assurance RC Pro. Vous pouvez consulter leurs avis clients et les contacter directement pour une intervention ou un devis.",
        ],
      },
    ],
    conclusion:
      "Un entretien régulier de votre installation de chauffage vous évite les pannes hivernales, réduit votre facture énergétique et prolonge la durée de vie de vos équipements. GoServi vous met en contact avec des chauffagistes qualifiés dans toute la Suisse romande.",
    relatedSlugs: [
      "prix-artisan-suisse-romande",
      "choisir-artisan-qualifie-suisse",
      "electricien-agree-suisse-romande",
    ],
    ctaText: "Trouver un chauffagiste qualifié",
    ctaHref: "/trouver-artisan",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getRelatedPosts(slugs: string[]): BlogPost[] {
  return BLOG_POSTS.filter((p) => slugs.includes(p.slug));
}
