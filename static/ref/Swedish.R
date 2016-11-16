install.packages("ggplot2")
library(ggplot2)
bank <- read.csv("~/Documents/Work/showcase/static/csv/Interestrate and inflation Sweden 1908-2001.csv",header = T)
bank <- bank[1:94,]

bank$Central.bank.interest.rate.diskonto.average<-as.numeric(bank$Central.bank.interest.rate.diskonto.average)
bank$Period <- as.factor(bank$Period)
colnames(bank)[2] <- "Interest.Rate"

ggplot(bank,aes(x = Period,y = Inflation,fill=Interest.Rate))+
  stat_summary_bin(fun.y = "mean", geom = "bar") +
  scale_fill_gradient( low = "red",  high = "yellow")+
  theme(axis.text.x = element_text(angle = 90, size=8,hjust = 1))+
  ggtitle("Inflation")


