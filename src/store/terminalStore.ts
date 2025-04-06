
export type TerminalType = 'iPOS' | 'Aisino A75' | 'Verifone X990' | 'PAX S20';

export type Branch = 
  | 'Masvingo Branch' 
  | 'Mutare Branch' 
  | 'Chiredzi Branch' 
  | 'Gweru Branch' 
  | 'Chinhoyi Branch' 
  | 'Private Banking' 
  | 'Bindura Branch' 
  | 'Samora Branch' 
  | 'JMN Bulawayo' 
  | 'SSC Branch' 
  | 'Business Banking' 
  | 'Digital Services' 
  | 'CIB';

export interface Terminal {
  id: string;
  branch: Branch;
  type: TerminalType;
  name: string;
  terminalId: string;
  serialNumber: string;
  lineSerialNumber: string;
  dispatchDate: string;
  fedexTrackingNumber?: string;
  isReturned: boolean;
  returnDate?: string;
  returnReason?: string;
}
