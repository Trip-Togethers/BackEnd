import 'dotenv/config';
import { app } from './app';
import { connectDatabase } from './data-source';
import 'reflect-metadata';

const PORT: number = parseInt(process.env.PORT || '3000', 10);

(async () => {
  try {
    await connectDatabase();
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', (error as Error).message);
    process.exit(1);
  }
})();
