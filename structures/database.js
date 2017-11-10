const commando = require('discord.js-commando');

class Database {
	
	static registerUserDice(dice,userid,db){
		
		var newDiceIndex;
		var diceid;

		return db.get("SELECT COALESCE(MAX(dice.bagindex), 0) as maxindex FROM dice WHERE (UserID = ?)",userid).then(function(result){
			
			newDiceIndex = result.maxindex+1;
				
			return db.run("INSERT INTO dice (UserID,bagindex) Values(?,?);;",userid,newDiceIndex).then(function(res){
				var diceid = res.stmt.lastID;

				return Promise.all(dice.faces.map(function(ele,index){
					Database.registerFace(ele,diceid,index,db)
				})).then(function(info){
					return diceid;
				})
				

			})
					
		});		
		
			
		
	}
	
	static registerFace(face,diceID,index,db){
		db.run("INSERT INTO faces(DiceID,Score,Type,diceindex) VALUES (?,?,?,?)",diceID,face.value,face.type,index+1).then(function(fres){
			var faceid = fres.stmt.lastID;
			
			
			return Promise.all(face.mods.map(function(ele,index){
				Database.registerMod(ele,faceid,index,db)
			})).then(function(info){
				return;
			});
			

			

		});
	}
	static registerMod(mod,faceID,index,db){

			return db.run("INSERT INTO mods(FaceID,Mod,faceindex) VALUES (?,?,?)",faceID,mod,index+1);
		
	}

	

	static getActiveDice(userid,db,dtype = "user"){
		
		return  db.get("SELECT activedice FROM users WHERE UserID = ?",userid).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO users (UserID) VALUES (?)",userid).then(function(resthing){
					const Dice = require("../commands/dice/diceclass");
					var ndice = new Dice();
					ndice.generate(dtype);
					return Database.registerUserDice(ndice,userid,db).then(function(diceid){

						return db.run("UPDATE users SET activedice = 1 WHERE UserID = ?",userid).then(function(res){
							
							return Database.getDice(diceid,db);

						});
					});
				})
			}
			var active = res.activedice;
			if(active == 0){
				
				const Dice = require("../commands/dice/diceclass");
				var ndice = new Dice();
				ndice.generate(dtype);
				return Database.registerUserDice(ndice,userid,db).then(function(diceid){
					return db.run("UPDATE users SET activedice = 1 WHERE UserID = ?",userid).then(function(res){
						return Database.getDice(diceid,db);
					});
				});
				
			}else{
				return db.get("SELECT DiceID FROM dice WHERE userid = ? AND bagindex = ? ",userid,active).then(function(res){
					
					return Database.getDice(res.DiceID,db);
				});
				
			}

		})
	}
	static async getDice(DiceID,db){
		//var axed;
		var faces = [];
		var boosts = {};
		var emoji = {};
			var dice = await db.all("SELECT Type,Score,FaceID FROM faces WHERE DiceID = ? ORDER BY diceindex ASC",DiceID).then(function(res2){
				
				
				return Database.getFacepart(res2,faces,0,db).then(function(faceres){
					faces = faceres;
					const Dice = require("../commands/dice/diceclass");
					var dice = new Dice(DiceID);
					dice.setFaces(faces);
					return dice;
				})
		})
		const Dice = require("../commands/dice/diceclass");
		return Dice.toDice(dice);
	}

	static async getDiceByIndex(userid,index,db){
		var resdiceid = await db.get("SELECT DiceID as diceid FROM dice WHERE UserID = ? AND bagindex = ?",userid,index);
		var diceid = resdiceid.diceid;
		return await Database.getDice(diceid,db);


	}

	static async deleteDiceByIndex(userid,index,db){
		//delete the dice
		//lower the indexes higher then it
		//lower user index if nececerry
		var resdelete = await db.run("DELETE FROM dice WHERE UserID = ? AND bagindex = ?",userid,index);
		//await
		await Database.updateIndexes(userid,index,db);
		
		//NOTHING
	}

	static async  updateIndexes(userid,index,db){
		await db.run("UPDATE dice SET bagindex = bagindex-1 WHERE UserID = ? AND bagindex > ?",userid,index);
		if(index < await Database.getActiveDiceIndex(userid,db))
		await db.run("UPDATE users SET activedice = activedice-1 WHERE UserID = ?",userid);
		return;

	}

	static async getFacepart(res2,faces,index,db){
		if(index >= res2.length)
			return faces;
		faces[index] = {};
		faces[index].value = res2[index].Score;
		faces[index].type = res2[index].Type;
		return Database.getMods(res2[index].FaceID,db).then(function(res7){
			faces[index].mods = res7;
			return Database.getFacepart(res2,faces,index+1,db).then();
		})
		


	}


	static getMods(FaceID,db){
		return db.all("SELECT mod FROM mods WHERE FaceID = ? ORDER BY faceindex ASC",FaceID).then(function(res2){
			var mods = [];
			for(var i = 0;i<res2.length;i++){
				
				mods.push(res2[i].mod);
			}
			return mods;
		});
	}

	static async getAllDice(userid,db){
		var resids =  await db.all("SELECT DiceID as diceid FROM dice WHERE UserID = ? ORDER BY bagindex ASC",userid);
		var dicearr = [];
		for(var i = 0;i<resids.length;i++){
			var d = await Database.getDice(resids[i].diceid,db);
			dicearr.push(d);
		}
		return dicearr;
	}
	static async getActiveDiceIndex(userid,db){
		var ires = await db.get("SELECT activedice FROM users WHERE userid = ?",userid);
		return ires.activedice;

	}

	static async updateActiveDiceIndex(userid,activedice,db){
		return await db.run("UPDATE users SET activedice = ? WHERE UserID = ?",activedice,userid);
	}
	static async getMaxDiceIndex(userid,db){
		var mres = await db.get("SELECT MAX(bagindex) AS maxind FROM dice WHERE UserID = ?",userid);
		return mres.maxind;
	}

	static async getDiceBoosts(diceid,boostid,db){
		await Database.makeDiceBoostIfNotExist(diceid,boostid,db);
		var res =  await db.get("SELECT amount FROM boosts WHERE DiceID = ? AND BoostID = ?",diceid,boostid);
		return res.amount;
	}
	static async addToDiceBoosts(diceid,boostid,amount,db){
		await Database.makeDiceBoostIfNotExist(diceid,boostid,db);
		return await db.run("UPDATE boosts SET amount = amount+? WHERE DiceID = ? AND BoostID = ?",amount,diceid,boostid);
	}
	static async makeDiceBoostIfNotExist(diceid,boostid,db){
		return  db.get("SELECT DiceID, BoostID FROM boosts WHERE DiceID = ? AND BoostID = ?",diceid,boostid).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO boosts (DiceID,BoostID) VALUES (?,?)",diceid,boostid).then(function(resthing){
					return;
				});
			}
		});
	}

	static async addOneToRandomFace(diceid,db){
		return await db.run("UPDATE faces SET Score = Score+1 WHERE FaceID in (SELECT FaceID FROM faces WHERE DiceID = ? ORDER BY random() LIMIT 1 );",diceid)
	}

	static async removeHalfAndGetVal(diceid,db){
		var res = await db.get("SELECT CAST(((CAST (score AS REAL))/2 + 0.5) AS INT) as half FROM faces WHERE FaceID IN (SELECT FaceID as dman FROM faces WHERE DiceID = ? AND score IN (SELECT MAX(score) FROM faces WHERE DiceID = ?) );",diceid,diceid);
		var toremove = res.half;
		await db.run("UPDATE faces SET score = score-? WHERE FaceID IN (SELECT FaceID FROM faces WHERE DiceID = ? AND score IN (SELECT MAX(score) FROM faces WHERE DiceID = ?) LIMIT 1);",toremove,diceid,diceid);
		return toremove;
	}

	static async changeTypeAToB(diceid,typefrom,typeto,db){
		return await db.run("UPDATE faces SET type = ? WHERE type = ? AND DiceID = ?",typeto,typefrom,diceid);
	}
	static async getAxeCount(diceid,db){
		var res = await db.get("SELECT Axed as axed FROM dice WHERE DiceID = ?",diceid);
		console.log("AXED: ",res.axed);
		console.log("DiceID: "+diceid);
		return res.axed;
	}
	static async upAxeCount(diceid,db){
		return await db.run("UPDATE dice SET axed = axed+1 WHERE DiceID = ?",diceid);
	}
	static async deleteRandomFace(diceid,db){
		var fres = await db.get("SELECT FaceID AS id, diceindex as ind FROM faces WHERE FaceID IN (SELECT FaceID FROM faces WHERE DiceID = ? ORDER BY random() LIMIT 1 )",diceid)
		await db.run("DELETE FROM faces WHERE FaceID = ? ",fres.id);
		await db.run("UPDATE faces SET diceindex = diceindex-1 WHERE DiceID = ? AND diceindex > ?",diceid,fres.ind);
		return;
	}
	static async removeAllMods(diceid,db,mod = ""){
		if(mod == ""){
			return await db.run("DELETE FROM mods WHERE FaceID IN (SELECT FaceID FROM faces WHERE DiceID = ?)",diceid);
		}else
		{
			return await db.run("DELETE FROM mods WHERE FaceID IN (SELECT FaceID FROM faces WHERE DiceID = ?) AND mod = ?",diceid,mod);
		}
	}

	static async addMod(diceid,findex,mod,db){
		var res = await db.get("SELECT FaceID as fid FROM faces WHERE DiceID = ? AND diceindex = ?",diceid,findex);
		var faceid = res.fid;
		return await db.run("INSERT INTO mods(FaceID,mod,faceindex) VALUES(?,?,(SELECT  COALESCE(MAX(faceindex), 0)+1 FROM mods WHERE FaceID = ?))",faceid,mod,faceid);
	}

	static async removeModsFromFace(diceid,findex,db){
		var res = await db.get("SELECT FaceID as fid FROM faces WHERE DiceID = ? AND diceindex = ?",diceid,findex);
		var faceid = res.fid;
		return await db.run("DELETE FROM mods WHERE FaceID = ?",faceid);
	}

	static async setFaceToType(diceid,faceindex,type,db){
		var res = await db.get("SELECT FaceID as fid FROM faces WHERE DiceID = ? AND diceindex = ?",diceid,faceindex);
		var faceid = res.fid;
		return await db.run("UPDATE faces SET type = ? WHERE FaceID = ?",type,faceid);
		
	}
	static async setTrade(senderid,receiverid,exptime,offertype,offerval,wanttype,wantval,db){
		await db.run("DELETE FROM trades WHERE SenderID = ? AND ReceiverID = ?",senderid,receiverid);
		return await db.run("INSERT INTO trades(SenderID,ReceiverID,exptime,offertype,offerval,wanttype,wantval) VALUES (?,?,?,?,?,?,?)",senderid,receiverid,exptime,offertype,offerval,wanttype,wantval);
	}
	static async removeTrade(senderid,receiverid,db){
		return await db.run("DELETE FROM trades WHERE SenderID = ? AND ReceiverID = ?",senderid,receiverid);
	}
	static async getTrade(senderid,receiverid,db){
		return await db.get("SELECT exptime,offertype,offerval,wanttype,wantval FROM trades WHERE SenderID = ? AND ReceiverID = ?",senderid,receiverid)
	}
	static async getOwnerOfDice(diceid,db){
		var res = await db.get("SELECT UserID as uid FROM dice WHERE DiceID = ?",diceid);
		return res;
	}
	static async changeDiceOwner(diceid,newownerid,db){
		var resoldowner = await db.get("SELECT UserID as uid, bagindex FROM dice WHERE DiceID = ?",diceid);
		//console.log("RESOLDOWNER: "+resoldowner.uid);
		var maxDiceIndex = await Database.getMaxDiceIndex(newownerid,db);
		console.log("MAXIND: "+maxDiceIndex);
		await db.run("UPDATE dice SET UserID = ?, bagindex = ? WHERE DiceID = ?",newownerid,maxDiceIndex+1,diceid);
		await Database.updateIndexes(resoldowner.uid,resoldowner.bagindex,db);
		return;
	}
	static async setFaceToScore(diceid,faceindex,score,db){
		var res = await db.get("SELECT FaceID as fid FROM faces WHERE DiceID = ? AND diceindex = ?",diceid,faceindex);
		var faceid = res.fid;
		return await db.run("UPDATE faces SET score = ? WHERE FaceID = ?",score,faceid);
	}


	static createUserIfNotExist(userid,db){

			
		return  db.get("SELECT UserID FROM users WHERE UserID = ?",userid).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO users (UserID) VALUES (?)",userid).then(function(resthing){
					return;
				});
			}
		});
	}

	static changeMoney(userid,amount,db){
		return db.run("UPDATE users SET  money = money+? WHERE userid = ?",amount,userid).then(function(result){
			return result.money;
		})
	}

	static getMoney(userid,db){
		return db.get("SELECT money FROM users WHERE userid = ?",userid).then(function(result){
			return result.money;
		})
	}

	static changeReputation(userid,amount,db){
		return db.run("UPDATE users SET  reputation = reputation+? WHERE userid = ?",amount,userid).then(function(result){
			return result.reputation;
		})
	}

	static getReputation(userid,db){
		return db.get("SELECT reputation FROM users WHERE userid = ?",userid).then(function(result){
			return result.reputation;
		})
	}

	static async setDaily(userid,key,db,extra = "."){
		await Database.makeDailyIfNotExist(userid,key,db);
		return await db.run("UPDATE daily SET lastaccessed = date(\'now\'), extra = ? WHERE userid = ? AND DailyID = ?",extra,userid,key);
	}

	static async updateDaily(userid,key,extra,db){
		await Database.makeDailyIfNotExist(userid,key,db);
		return await db.run("UPDATE daily SET extra = ? WHERE userid = ? AND DailyID = ?",extra,userid,key);
	
	}

	static async getDaily(userid,key,db){
		await Database.makeDailyIfNotExist(userid,key,db);
		var res = await db.get("SELECT LastAccessed as lastday, date(\'now\') as today, extra AS extra FROM daily WHERE UserID = ? AND DailyID = ?",userid,key)
		return res;
	}

	static makeDailyIfNotExist(userid,key,db){
		return  db.get("SELECT UserID, DailyID FROM daily WHERE UserID = ? AND DailyID = ?",userid,key).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO daily (UserID,DailyID,LastAccessed) VALUES (?,?,\'never\')",userid,key).then(function(resthing){
					return;
				});
			}
		});
	}

	static async setHourly(userid,nextime,key,db,extra = "."){
		await Database.makeHourlyIfNotExist(userid,key,db);
		return await db.run("UPDATE Hourly SET untill = strftime('%s','now')+? WHERE userid = ? AND HourlyID = ?",nextime,userid,key);
	}

	static async getHourly(userid,key,db){
		await Database.makeHourlyIfNotExist(userid,key,db);
		var res = await db.get("SELECT untill as lasttime, strftime('%s','now') as now FROM Hourly WHERE UserID = ? AND HourlyID = ?",userid,key)
		return res;
	}
	static makeHourlyIfNotExist(userid,key,db){
		return  db.get("SELECT UserID, HourlyID FROM hourly WHERE UserID = ? AND HourlyID = ?",userid,key).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO hourly (UserID,HourlyID,Untill) VALUES (?,?,0)",userid,key).then(function(resthing){
					return;
				});
			}
		});
	}

	static async setFlag(userid,flagname,flagdata,db){
		await Database.makeFlagIfNotExist(userid,flagname,db);
		return await db.run("UPDATE flags SET extra = ? WHERE userid = ? AND FlagID = ?",flagdata,userid,flagname);
	}

	static async getFlag(userid,flagname,db){
		await Database.makeFlagIfNotExist(userid,flagname,db);
		var res = await db.get("SELECT extra FROM flags WHERE UserID = ? AND FlagID = ?",userid,flagname)
		return res.extra;
	}

	static async makeFlagIfNotExist(userid,flagname,db){
		return  db.get("SELECT UserID, FlagID FROM flags WHERE UserID = ? AND FlagID = ?",userid,flagname).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO flags (UserID,FlagID) VALUES (?,?)",userid,flagname).then(function(resthing){
					return;
				});
			}
		});
	}

	static async upConsecutive(userid,consecutivename,db){
		await Database.makeConsecutiveIfNotExist(userid,consecutivename,db);
		return await db.run("UPDATE Consecutive SET amount = amount+1 WHERE userid = ? AND ConsID = ?",userid,consecutivename);
	}
	static async breakConsecutive(userid,consecutivename,db){
		await Database.makeConsecutiveIfNotExist(userid,consecutivename,db);
		return await db.run("UPDATE Consecutive SET amount = 0 WHERE UserID = ? AND ConsID = ?",userid,consecutivename);
	}
	static async getConsecutive(userid,consecutivename,db){
		await Database.makeConsecutiveIfNotExist(userid,consecutivename,db);
		var res = await db.get("SELECT amount FROM Consecutive WHERE UserID = ? AND ConsID = ?",userid,consecutivename)
		return res.amount;
	}

	static async makeConsecutiveIfNotExist(userid,consecutivename,db){
		return  db.get("SELECT UserID, ConsID FROM Consecutive WHERE UserID = ? AND ConsID = ?",userid,consecutivename).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO Consecutive (UserID,ConsID) VALUES (?,?)",userid,consecutivename).then(function(resthing){
					return;
				});
			}
		});
	}

	static async getEmojiCollection(id,db){
		var res = await db.all("SELECT EmojiName as emoji FROM EmojiCollected WHERE UserID = ? AND server = \'discord\' ORDER BY rowid ASC",id);
		var arr = [];
		for(var i = 0;i<res.length;i++)
		{
			arr.push(res[i].emoji);
		}
		return arr;
	}
	static async getServerEmojiCollection(id,server,db){
		var res = await db.all("SELECT EmojiName as emoji FROM EmojiCollected WHERE UserID = ? AND server = ? ORDER BY rowid ASC",id,server);
		var arr = [];
		for(var i = 0;i<res.length;i++)
		{
			arr.push(res[i].emoji);
		}
		return arr;
	}
	static async addToCollection(id,name,db,server){
		try{
			await db.run("INSERT INTO emojicollected(UserID,EmojiName,server) VALUES (?,?,?)",id,name,server);
			return true;
		}catch(err){
			return false;
		}
		return true;
	}
	static async getNumberEmojiDefeated(diceid,difficulty,db){
		var res = await db.get("SELECT count(*) AS num FROM emojidefeated NATURAL JOIN emojidifficulty WHERE difficulty = ? AND DiceID = ?",difficulty,diceid);
		return res.num;
	}
	static async getEmojiDefeated(diceid,difficulty,db){
		var res = await db.all("SELECT EmojiName AS emoji FROM emojidefeated NATURAL JOIN emojidifficulty WHERE difficulty = ? AND DiceID = ?",difficulty,diceid);
		var arr = [];
		for(var i = 0;i<res.length;i++)
		{
			arr.push(res[i].emoji);
		}
		return arr;
	}
	static async addToEmojiDefeated(diceid,name,difficulty,server,db){
		try{//TODO: Improve error handling (Primary key errors are expected)
			await db.run("INSERT INTO emojidefeated(DiceID,EmojiName,server) VALUES (?,?,?)",diceid,name,server);
			//return true;
		}catch(err){
			return false;
		}
		
		try{
			await db.run("INSERT INTO emojidifficulty(EmojiName,difficulty) VALUES(?,?)",name,difficulty);
		}catch(err)
		{
			return true;
		}
		return true;
	}

	

	static async getAllItems(userid,db){
		var res = await db.all("SELECT Amount as amount, ItemID as id FROM items WHERE UserID = ?",userid);
		return res;
	}
	static async getItemQuantity(userid,itemid,db){
		await Database.makeItemIfNotExist(userid,itemid,db);
		var res =  await db.get("SELECT Amount as amount FROM items WHERE UserID = ? AND ItemID = ?",userid,itemid);
		if(!res)
			return {amount:0};
		return res;
	}

	static async addItem(userid,itemid,amount,db){
		await Database.makeItemIfNotExist(userid,itemid,db);
		return await db.run("UPDATE items SET Amount = Amount+? WHERE UserID = ? AND ItemID = ?",amount,userid,itemid);
	}

	static async looseItem(userid,itemid,amount,db){
		await Database.makeItemIfNotExist(userid,itemid,db);
		return await db.run("UPDATE items SET Amount = Amount-? WHERE UserID = ? AND ItemID = ?",amount,userid,itemid);
	}
	static async makeItemIfNotExist(userid,itemid,db){
		return  db.get("SELECT UserID, ItemID FROM items WHERE UserID = ? AND ItemID = ?",userid,itemid).then(function(res){
			if(!res)
			{
				return db.run("INSERT INTO items (UserID,ItemID,Amount) VALUES (?,?,0)",userid,itemid).then(function(resthing){
					return;
				});
			}
		});
	}
	
	static async getRoulette(db){
		var res = await db.all("SELECT RouletteID as rouletteid, Extra as extra FROM roulette ORDER BY rouletteindex ASC");
		return res;
	}
	static async setRoulette(roul,db){
		await db.run("DELETE FROM roulette");
		for(var i = 0;i<roul.length;i++){
			db.run("INSERT INTO roulette(rouletteindex,RouletteID,Extra) VALUES (?,?,?)",i+1,roul[i].id,roul[i].extra);
		}
	}
	
}
module.exports = Database;