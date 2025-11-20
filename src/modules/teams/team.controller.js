import { addMember, createTeam, listMembers, listTeams } from './team.service.js';

export const createTeamHandler = async (req, res, next) => {
  try {
    const { body } = req.validated;
    const team = await createTeam({ ownerId: req.user.userId, ...body });
    return res.status(201).json(team);
  } catch (error) {
    return next(error);
  }
};

export const listTeamsHandler = async (req, res, next) => {
  try {
    const teams = await listTeams({ ownerId: req.user.userId });
    return res.json(teams);
  } catch (error) {
    return next(error);
  }
};

export const addMemberHandler = async (req, res, next) => {
  try {
    const { params, body } = req.validated;
    const member = await addMember({
      teamId: params.teamId,
      ownerId: req.user.userId,
      member: body,
    });
    return res.status(201).json(member);
  } catch (error) {
    return next(error);
  }
};

export const listMembersHandler = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const members = await listMembers({
      teamId,
      ownerId: req.user.userId,
    });
    return res.json(members);
  } catch (error) {
    return next(error);
  }
};



