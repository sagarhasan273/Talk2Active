export type PostItemProps = {
  id: string;
  title: string;
  price: number;
  coverUrl: string;
  totalDuration: number;
  totalStudents: number;
  header: {
    caption: string;
    photoUrl: string;
    time: string;
    userName: string;
    alt: string;
  };
};
