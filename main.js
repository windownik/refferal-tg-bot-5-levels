const TelegramAPI = require('node-telegram-bot-api');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(
    'reff_bot',
    'postgres',
    '102015',
    {
        host: '127.0.0.1',
        port: '5432',
        dialect: 'postgres'
    }
)


const token = '5461551803:AAH9oVWT5zxkcmgrunIN-0-PgI63EZKIJ54'

const bot = new TelegramAPI(token, {polling: true})

const start = async () => {
    bot.on('message', async message => {
        user_id = message.from.id
        const text = message.text
        if (text.startsWith('/start')) {
            if (message.text.includes(' reff')){
                reff_id = message.text.split(' reff')[1]
            } else {
                reff_id = 0
            }
            if (message.from.username === undefined){
                username = '0'
            } else {
                username = message.from.username
            }

            sequelize.query(`SELECT id FROM all_users WHERE tg_id = ${user_id}`).then(results => {
                if (results[0].length == 0) {
                    sequelize.query(`INSERT INTO all_users (tg_id, first_name, username, reff_id) VALUES (?, ?, ?, ?) ON CONFLICT DO NOTHING;`, {replacements: [user_id, message.from.first_name, username, reff_id]})
                    bot.sendMessage(user_id, 'Поздравдяю ты зарегистрировался')
                } else {
            bot.getMe().then(function (info) {
            ans_text = `Ты уже зарегистрирован!\nВот твоя реферальная ссылка\n\nhttps://t.me/${info.username}?start=reff${user_id}`
            bot.sendMessage(user_id, ans_text)
            });
                
                }
            });
        return
        }
        if (text === '/create_db') {
            sequelize.query("CREATE TABLE IF NOT EXISTS all_users (id SERIAL PRIMARY KEY, tg_id BIGINT UNIQUE, first_name TEXT, username TEXT, reff_id BIGINT)");
            return
        }
        // Кто платит нам строим дерево в низ
        if (text === '/i_mentor') {
            const [results, metadata] = await sequelize.query(`SELECT tg_id, first_name FROM all_users WHERE reff_id = ${user_id}`).then(result => {return result});
            if (results.length === 0) {
                bot.sendMessage(user_id, "Нет пользователей пришедших по вашей ссылке")
                return
            }
            // Первый уровень рефералов
            reff1 = `Первый уровень рефералов ${results.length}:\n`
            sql_level_1 = ''
            
            results.forEach(one => {
                if (reff1 !== ''){
                    sql_level_1 = `${sql_level_1} OR reff_id = ${one['tg_id']}`
                }
                reff1 = `${reff1}${one["first_name"]}, `
            });

            const [result2, metadata2] = await sequelize.query(`SELECT tg_id, first_name FROM all_users WHERE reff_id = ${results[0]['tg_id']}${sql_level_1}`).then(result => {return result});
            if (result2.length === 0) {
                bot.sendMessage(user_id, reff1)
                return
            }
            // Второй уровень рефералов
            reff2 = `${reff1}\nВторой уровень рефералов ${result2.length}:\n`
            sql_level_2 = ''
            i = 0
            result2.forEach(two => {
                if (i !== 0){
                    sql_level_2 = `${sql_level_2} OR reff_id = ${two['tg_id']}`
                }
                i += 1
                reff2 = `${reff2}${two["first_name"]}, `
            });

            const [result3, metadata3] = await sequelize.query(`SELECT tg_id, first_name FROM all_users WHERE reff_id = ${result2[0]['tg_id']}${sql_level_2}`).then(result => {return result});
            if (result3.length === 0) {
                bot.sendMessage(user_id, reff2)
                return
            }
            // Третий уровень рефералов
            reff3 = `${reff2}\nТретий уровень рефералов ${result3.length}:\n`
            sql_level_3 = ''
            i = 0
            result3.forEach(three => {
                if (i !== 0){
                    sql_level_3 = `${sql_level_3} OR reff_id = ${three['tg_id']}`
                }
                i += 1
                reff3 = `${reff3}${three["first_name"]}, `
            });

            const [result4, metadata4] = await sequelize.query(`SELECT tg_id, first_name FROM all_users WHERE reff_id = ${result3[0]['tg_id']}${sql_level_3}`).then(result => {return result});
            if (result4.length === 0) {
                bot.sendMessage(user_id, reff3)
                return
            }
            // Четвертый уровень рефералов
            reff4 = `${reff3}\nЧетвертый уровень рефералов ${result4.length}:\n`
            sql_level_4 = ''
            i = 0
            result4.forEach(four => {
                if (i !== 0){
                    sql_level_4 = `${sql_level_4} OR reff_id = ${four['tg_id']}`
                }
                i += 1
                reff4 = `${reff4}${four["first_name"]}, `
            });

            const [result5, metadata5] = await sequelize.query(`SELECT tg_id, first_name FROM all_users WHERE reff_id = ${result4[0]['tg_id']}${sql_level_4}`).then(result => {return result});
            if (result4.length === 0) {
                bot.sendMessage(user_id, reff4)
                return
            }
            // Пятый уровень рефералов
            reff5 = `${reff4}\nПятый уровень рефералов ${result5.length}:\n`
            sql_level_5 = ''
            i = 0
            result5.forEach(five => {
                if (i !== 0){
                    sql_level_5 = `${sql_level_5} OR reff_id = ${five['tg_id']}`
                }
                i += 1
                reff5 = `${reff5}${five["first_name"]}, `
            });
            bot.sendMessage(user_id, reff5)
            return
        }
        // Кому мы платим строим дерево вверх
        if (text === '/i_pay') {
            var [my_mentor, metadata] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${user_id}`).then(result => {return result});
            if (my_mentor[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, "Вы зарегистрировались без реферальной ссылки")
                return
            } else {
                tg_id = my_mentor[0]['reff_id']
                var [mentor_user, metadata] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
                tg_id = mentor_user[0]['reff_id']
            }
            console.log(tg_id)
            send_text = `Вас привлек пользователь: ${mentor_user[0]['first_name']}`
            // Второй уровень
            const [my_mentor2, metadata2] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor2[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {  
                tg_id = my_mentor2[0]['reff_id']
            }
            send_text = `${send_text}\n2 уровень: ${my_mentor2[0]['first_name']}`
            // Третий уровень
            const [my_mentor3, metadata3] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor3[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {tg_id = my_mentor3[0]['reff_id']}
            send_text = `${send_text}\n3 уровень: ${my_mentor3[0]['first_name']}`
            // Четвертый уровень
            const [my_mentor4, metadata4] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor4[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {tg_id = my_mentor4[0]['reff_id']}
            send_text = `${send_text}\n4 уровень: ${my_mentor4[0]['first_name']}`
            // Пятый уровень
            const [my_mentor5, metadata5] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            send_text = `${send_text}\n5 уровень: ${my_mentor5[0]['first_name']}`
            bot.sendMessage(user_id, send_text)
            return
        }
        // Считаем процент для платы рефералам в верх
        numbStatus = true
        check_text = text.split('')
        check_text.forEach(one => {
            if ('0123456789'.includes(one)){
            } else {numbStatus = false}
        });
        if (numbStatus) {
            money = parseInt(text)
            percent = [0.005, 0.0025, 0.001, 0.0005, 0.0005, 0.0005]
            var [me, metadata] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${user_id}`).then(result => {return result});
            if (me[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, "Вы зарегистрировались без реферальной ссылки")
                return
            } else {tg_id = me[0]['reff_id']
            var [my_mentor, metadata] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            tg_id = my_mentor[0]['reff_id']
        }

            send_text = `Вас привлек пользователь: ${my_mentor[0]['first_name']} его 0.5% ${money*0.005}`
            // Второй уровень
            const [my_mentor2, metadata2] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor2[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {tg_id = my_mentor2[0]['reff_id']}
            send_text = `${send_text}\n2 уровень: ${my_mentor2[0]['first_name']} его 0.25% ${money*0.0025}`
            // Третий уровень
            const [my_mentor3, metadata3] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor3[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {tg_id = my_mentor3[0]['reff_id']}
            send_text = `${send_text}\n3 уровень: ${my_mentor3[0]['first_name']} его 0.10% ${money*0.001}`
            // Четвертый уровень
            const [my_mentor4, metadata4] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            if (my_mentor4[0]['reff_id'] === '0') {
                bot.sendMessage(user_id, send_text)
                return
            } else {tg_id = my_mentor4[0]['reff_id']}
            send_text = `${send_text}\n4 уровень: ${my_mentor4[0]['first_name']} его 0.05% ${money*0.0005}`
            // Пятый уровень
            const [my_mentor5, metadata5] = await sequelize.query(`SELECT reff_id, first_name FROM all_users WHERE tg_id = ${tg_id}`).then(result => {return result});
            send_text = `${send_text}\n5 уровень: ${my_mentor5[0]['first_name']} его 0.05% ${money*0.0005}`

            bot.sendMessage(user_id, send_text)
            return
        }
        bot.getMe().then(function (info) {
          ans_text = `Вот твоя реферальная ссылка\nКому я плачу /i_pay\nКого я привлек /i_mentor\nОтправьте число для проверки отчислений
          \n\nhttps://t.me/${info.username}?start=reff${user_id}`
          bot.sendMessage(user_id, ans_text)
          });
        

    })
}


start()  