import { useQuery } from '@tanstack/react-query';
import { getCommittee, getCommitteeMembers, getChairperson } from '@/lib/api/committee';

export function useCommittee() {
  return useQuery({
    queryKey: ['committee'],
    queryFn: getCommittee,
  });
}

export function useCommitteeMembers() {
  return useQuery({
    queryKey: ['committee', 'members'],
    queryFn: getCommitteeMembers,
  });
}

export function useChairperson() {
  return useQuery({
    queryKey: ['committee', 'chairperson'],
    queryFn: getChairperson,
  });
}
