import { initializeApp, cert, getApps } from 'firebase-admin/app';

const firebaseAdminConfig = {
  credential: cert({
    projectId:"glucolog-f2a0a",
    clientEmail: "firebase-adminsdk-dhge3@glucolog-f2a0a.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC6goToCexifapy\n9Rnmu3rWaYN3BimsIs5sU9G8fTo8rUN9C90Ul0VhfxmMW4SF9d37x2z0qoU/RP9Z\nuaCA6PK5xibpZlJtuM4hLk8Abv9XuzK4V9TgGd9riWQXu7zzgqZRYpVlP0gQdMN8\nWWN4ePxhnpm7jOn9Zz0Huf0EqPPv6s1JFlAVAkZTXoHA2cqZ9LWtlFteHooXKeGt\nkXpBvdrc0jVf32FHYSN9eMk82LfarxX4dw/K6vR/onDitOg0kI9cQ5shJ4aWyztQ\nPhD4rgkqKa9E4+oWl1pf70WDGT3coj1FnXZGgzW+T2v6XNxee6Cubg6j1IPuR+F4\nyEVnktvzAgMBAAECggEAAghbSekwD6god2k1ey9AFhUDBCJOIbRCF3b4vB+fmvyu\n/ej11Rl1k7Mjqs/jjURQQybKJe03QYuRDvp2FICqdDLbk4Gj34INXzkeDMFfyS18\nPFpXNl6pITZeyAvy/NACUNktli4NIiMt64rUbJgjeM7jPwctxDoaVoAl0sL2u65D\nRAeXPv5LEr48KA4s0+uHUsjhuQeLRBdK3wY3TqreCPOVPjTVaVivQuw/kzWYWlYN\ndmQLRNnt/hKiEG49kG1Ei/tfar3RQXKTq9fux9qF7KeSg3QQmP1CXu1wHOJhaZYj\nQBevlxr1/RdrPrnuVNKmoLNjOQ1jyyp6yNLT2XXMxQKBgQDkpFvp0RulNgBd9l5g\ncZ2Q64aGkYzs4AiEnSHb43KzpaZLWQOqNTA564Hn3H3WPK3arTeFZH8JVdlf6aWL\nj792AvMON+2ZAvckIRqq4r+NP+EvLYtqHwNF7SD06GNWVYAGGisI6grqOOxETd5y\n5wUURKZ1vvP47sZQcgMe7DsNFQKBgQDQ05biLA/gC63jhOlRXzW6b2kSi8XiQ/i6\nGrt+0Vsgr3y5joDqWQwZhOjCY1nQgRFoPBRcMjSFjMMVMI6uIT6CStEy1FqUzctI\nMYxq+GA0JY1K+rHy33zL+aqjMSm2KNHyVOsw0RT5NB12+e0zLA68klj1nRdLFj6o\nIM11w5FW5wKBgQC8ykHipPkwx5AyBdYTyHyURwXDY7d7d9lQtvZYPExfre3L1WpD\nRrvVd3LCYru9BEmBgPmROVPz/2EH40MAI+exp+nN2bxkVaB/wp3kcGo+VXq4m+C7\n9XOcb5qA3sn3ZY3afA0AxU/R6sKb+7gsJDl7bNwN6WhGKdKyZhHRnLl9qQKBgQDE\nk/n8LNhA4x2tCMgOFp9gQlJZ6AO+rJeusU2A4xlyml/B2TjX4j12pFvr6VR555X4\nVl4gMA6rDUfzYYNeveK3CjEGNUqTu2o6KpJxfCAr1pG8XGQ5KlKzPPJ5ruUCGkkQ\nYwoHKTsiIAIApuK4gifZMbbWdyufPnB7Gm3vBsuBTwKBgGotu8VLX9wDqLzGNzlp\n1Jngta47tVeqxf18TRPhX4+m3xBh1FgZljO1fbSNa5Uc41ZoEwPd6ysnRzWCnEac\n7VVCRQxx+BqadB3YGvvzJfxXQ7tcr0zVwTV2+KePxvhPgLumhU0u/Qf2eA23UJKm\n7DnUY3hMEhHzIdG620YEBt+R\n-----END PRIVATE KEY-----\n"?.replace(/\\n/g, '\n'),
  }),
};

export const initAdmin = () => {
  if (getApps().length === 0) {
    initializeApp(firebaseAdminConfig);
  }
};
