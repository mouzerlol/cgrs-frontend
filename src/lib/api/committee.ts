import { Committee, CommitteeMember } from '@/types';

interface CommitteeData {
  chairperson: CommitteeMember;
  members: CommitteeMember[];
}

async function importCommitteeData(): Promise<CommitteeData> {
  const data = await import('@/data/committee.json');
  return data.default as CommitteeData;
}

export async function getCommittee(): Promise<Committee> {
  const data = await importCommitteeData();
  return {
    chairperson: data.chairperson,
    members: data.members,
  };
}

export async function getCommitteeMembers(): Promise<CommitteeMember[]> {
  const data = await importCommitteeData();
  return [data.chairperson, ...data.members];
}

export async function getChairperson(): Promise<CommitteeMember> {
  const data = await importCommitteeData();
  return data.chairperson;
}
