export interface HotWheelsProperties {
  manufacturer: string;         // e.g., "Mattel"
  model_name: string;           // e.g., "Custom '69 Chevy Pickup"
  series: string;               // e.g., "HW Hot Trucks"
  year: number | null;          // e.g., 2025
  color: string;                // e.g., "Matte Black"
  tampo_print: string;          // e.g., "Flames on hood"
  wheel_type: string;           // e.g., "5SP", "Real Riders"
  scale: string;                // e.g., "1:64"
  condition: string;            // e.g., "Carded Mint", "Loose"
  blister_condition: string;    // e.g., "Unpunched", "Punched"
  toy_number: string;           // e.g., "HTF56"
  is_treasure_hunt: boolean;
}

export const hotwheelsDefaults: HotWheelsProperties = {
  manufacturer: 'Mattel',
  model_name: '',
  series: '',
  year: null,
  color: '',
  tampo_print: '',
  wheel_type: '',
  scale: '1:64',
  condition: 'Carded Mint',
  blister_condition: 'Unpunched',
  toy_number: '',
  is_treasure_hunt: false,
};
