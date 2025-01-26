import express from 'express';
import { AppDataSource } from './data-source';

import communityRouter from './routes/community.routes';
import calendarRouter from './routes/calendar.routes';
import mapRouter from './routes/maps.routes';

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(express.json());

// 데이터베이스 초기화
AppDataSource.initialize()
    .then(() => {
        console.log('Database connected successfully!');

        app.use('/posts', communityRouter);
        app.use('/calendar', calendarRouter);
        app.use('/maps', mapRouter);

        // 서버 실행
        app.listen(app.get('port'), () => {
            console.log(`${app.get('port')} 번 포트에서 대기 중`);
        });
    })
    .catch((error) => {
        console.error('Error during Data Source initialization:', error);
    });
