import { UserListItem } from "../user-managment-interface";

export interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  userId: string;
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserDeleted: () => void;
  user: UserListItem | null;
}

export interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}